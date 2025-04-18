import { Fragment, useEffect, useState, useMemo, useRef } from 'react';
import useFetchShifts from './useFetchShifts';
import useFetchTimesheets from './useFetchTimesheets';
import useFetchEvents from './useFetchEvents';
import useFetchCalls from './useFetchCalls';
import MenuComponent from './MenuComponent';
import FilterControl from '../Controls/FilterControl';
import UserItemFull from '../Account/UserItemFull';
import ShiftProgressBar from './ShiftProgressBar';
import DrawerOverlay from '../Overlays/DrawerOverlay';
import './CalendarStyles.css';
import { format, startOfDay, endOfDay, subDays, addDays, set } from 'date-fns';
import { groupShifts, getStatus } from '../../Utils/Rota';
import ShiftView from './ShiftView';
import { useUserStates } from '../Context/ActiveStateContext';
import { UtilisationTargetsProvider } from '../Context/UtilisationTargetsContext.jsx';

export default function ListView({ setView, viewType }) {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadedItems, setLoadedItems] = useState(0); // Track how many items are loaded
  const [selectedShift, setSelectedShift] = useState(null);
  const container = useRef(null);

  const startDate = format(startOfDay(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfDay(currentDate), 'yyyy-MM-dd');

  const { shifts, isLoading: isLoadingShifts, isLoaded: isLoadedShifts } = useFetchShifts(startDate, endDate);
  const { timesheets, isLoading: isLoadingTimesheets, isLoaded: isLoadedTimesheets } = useFetchTimesheets(startDate, endDate);
  const { events, isLoading: isLoadingEvents, isLoaded: isLoadedEvents } = useFetchEvents(startDate, endDate);
  const { calls, isLoading: isLoadingCalls, isLoaded: isLoadedCalls } = useFetchCalls(startDate, endDate);

  const [filters, setFilters] = useState(() => {
    const userStates = useUserStates();

    return [
      {
        id: 'job_title',
        name: 'Job Title',
        expression: (shift, userStates) => (filterValue) => {
          const user = userStates[shift.hr_id];
          return user?.job_title === filterValue;
        },
        options: Array.from(
          new Set(Object.values(userStates).map((user) => user.job_title).filter(Boolean))
        )
          .sort((a, b) => a.localeCompare(b))
          .map((jobTitle) => ({
            value: jobTitle,
            label: jobTitle,
            checked: false,
          })),
      },
      {
        id: 'status',
        name: 'Status',
        expression: (shift, userStates, timesheets, events) => (filterValue) => {
          const { status } = getStatus(shift, timesheets, events);
          return status === filterValue;
        },
        options: [
          { value: 'Absent', label: 'Absent', checked: false },
          { value: 'Attended', label: 'Attended', checked: false },
          { value: 'Awol', label: 'Awol', checked: false },
          { value: 'Late', label: 'Late', checked: false },
          { value: 'Reduced', label: 'Reduced', checked: false },
          { value: 'Sick', label: 'Sick', checked: false },
          { value: 'Surplus', label: 'Surplus', checked: false },
        ].sort((a, b) => a.label.localeCompare(b.label)),
      },
    ];
  });
  
  const userStates = useUserStates();
  const groupedShifts = useMemo(() => {
    return groupShifts(shifts, false, (shift) => `${shift.shiftstart}`, timesheets, events, userStates, filters);
  }, [shifts, timesheets, filters]);
  
  useEffect(() => {
    if (shifts.length) {
      setIsTransitioning(false);
      setLoadedItems(0); // Reset loaded items
    }
  }, [shifts]);
  
  useEffect(() => {    
    if (isLoadedShifts && isLoadedTimesheets && isLoadedEvents && groupedShifts[startDate]) {
      let frameId;
      const updateLoadedItems = () => {
        setLoadedItems((prev) => {
          if (prev >= Object.values(groupedShifts[startDate]).reduce((acc, shiftsByTime) => acc + shiftsByTime.length, 0)) {
            cancelAnimationFrame(frameId);
            return prev;
          }
          return prev + 1;
        });
        frameId = requestAnimationFrame(updateLoadedItems);
      };
      frameId = requestAnimationFrame(updateLoadedItems);
      return () => cancelAnimationFrame(frameId);
    }
  }, [isLoadedShifts, isLoadedTimesheets, isLoadedEvents, groupedShifts]);

  useEffect(() => {
    if (selectedShift) {
      // Find the updated shift data
      const updatedShift = shifts.find((shift) => shift.unq_id === selectedShift.shift.unq_id);
  
      // Find the updated timesheets and events for the selected shift
      const updatedTimesheets = timesheets.filter((timesheet) => timesheet.hr_id == selectedShift.shift.hr_id);
      const updatedEvents = events.filter((event) => event.shift_id == selectedShift.shift.unq_id);
  
      // Update the selectedShift state with the latest data
      setSelectedShift({
        shift: updatedShift || selectedShift.shift, // Fallback to the current shift if not found
        timesheets: updatedTimesheets,
        events: updatedEvents,
      });
    }
  }, [shifts, timesheets, events]);

  const handlePreviousTimeframe = () => {
    setIsTransitioning(true);
    setCurrentDate(subDays(currentDate, 1));
    container.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextTimeframe = () => {
    setIsTransitioning(true);
    setCurrentDate(addDays(currentDate, 1));
    container.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filter) => {
    const updatedFilters = filters.map((section) => {
      if (section.id === filter.id) {
        return {
          ...section,
          options: section.options.map((option) =>
            option.value === filter.value ? { ...option, checked: filter.checked } : option
          ),
        };
      }
      return section;
    });
    // Update the filters state or perform any necessary actions with the updated filters
    setFilters(updatedFilters);
  }

  const clearFilters = () => {
    const updatedFilters = filters.map((section) => ({
      ...section,
      options: section.options.map((option) => ({ ...option, checked: false })),
    }));
    setFilters(updatedFilters);
  };

  return (
    <UtilisationTargetsProvider>
      <div className="flex h-full flex-col pb-16 sm:pb-0">
      <header className="flex flex-col items-center justify-end border-b border-gray-200 gap-x-2 space-y-2 px-6 py-4 divide-gray-200">
        <MenuComponent
          currentView={viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          setView={setView}
          currentDate={currentDate}
          handleNextTimeframe={handleNextTimeframe}
          handlePreviousTimeframe={handlePreviousTimeframe}
        />
      </header>
      <div className="flex flex-col items-end justify-end border-b border-gray-200 gap-x-2 space-y-2 pl-6 px-2 py-3 divide-gray-200">
          <FilterControl filters={filters} onFilterChange={handleFilterChange} clearFilters={clearFilters} />
      </div>
      <div ref={container} className="isolate flex flex-auto flex-col overflow-auto bg-white transition-all duration-500 ease-in-out items-center">
        <div className="flex max-w-full flex-none flex-col sm:max-w-none w-full md:max-w-full">
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                <table className="w-full text-left">
                  <tbody className="relative overflow-y-auto">
                    {(isLoadingShifts || isLoadingTimesheets || isLoadingEvents || isTransitioning) ? (
                      Array.from({ length: 3 }).map((_, headerIndex) => (
                        <Fragment key={`header-${headerIndex}`}>
                          {/* Loading Skeleton */}
                          <tr key={`row-${headerIndex}`} className="text-sm leading-6 text-gray-900">
                            <th scope="colgroup" colSpan={3} className="relative py-3 font-semibold">
                              <div className={`animate-pulse flex flex-col justify-center h-full w-full`}>
                                <div className="h-4 bg-gray-200 rounded-lg w-28"></div>
                              </div>
                              <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50 shadow-sm" />
                              <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50 shadow-sm" />
                            </th>
                          </tr>
                          {/* Sub-Rows */}
                          {Array.from({ length: 5 }).map((_, subRowIndex) => (
                            <tr key={`subrow-${headerIndex}-${subRowIndex}`}>
                              <td className="relative py-2 pr-6 w-4/5 sm:w-1/3">
                                <UserItemFull isLoading={true} />
                              </td>
                              <td className="hidden py-2 sm:table-cell pr-6">
                                <ShiftProgressBar isLoading={true} />
                              </td>
                              <td className="py-2 text-right w-20">
                                <div className={`animate-pulse flex flex-col items-end rounded h-10 w-1/2 ml-auto`}>
                                  <div className="h-4 bg-gray-100 rounded-lg w-14 mb-2"></div>
                                  <div className="h-4 bg-gray-100 rounded-lg w-14"></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    ) : Object.keys(groupedShifts).length === 0 ? (
                      // Display message when there are no shifts
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-sm text-gray-500">
                          No shifts available for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        let cumulativeIndex = 0; // Track the cumulative index across all grouped shifts

                        return Object.entries(groupedShifts).map(([date, shiftsByTime]) => (
                          <Fragment key={date}>
                            {Object.entries(shiftsByTime)
                              .sort(([keyA], [keyB]) => parseInt(keyA, 10) - parseInt(keyB, 10))
                              .map(([key, shifts]) => {
                                const startHour = parseInt(key.slice(0, 2), 10); // Extract hour
                                const startMinute = parseInt(key.slice(2, 4), 10); // Extract minute

                                const startDate = new Date();
                                startDate.setHours(startHour, startMinute, 0, 0); // Set hours and minutes

                                return (
                                  <Fragment key={key}>
                                    <tr key={`row-${key}`} className="text-sm leading-6 text-gray-900">
                                      <th scope="colgroup" colSpan={3} className="relative py-2 font-semibold">
                                        {isNaN(startDate.getTime())
                                          ? key.charAt(0).toUpperCase() + key.slice(1)
                                          : `Starting: ${format(startDate, 'h:mm a').toLowerCase()}`}
                                        <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50 shadow-sm" />
                                        <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50 shadow-sm" />
                                      </th>
                                    </tr>
                                    {shifts.map((shift) => {
                                      const isLoaded = cumulativeIndex < loadedItems;
                                      const relevantTimesheets = timesheets.filter((timesheet) => timesheet.hr_id == shift.hr_id);
                                      const relevantEvents = events.filter((event) => event.hr_id == shift.hr_id);
                                      const relevantCalls = calls.filter((event) => event.hr_id == shift.hr_id);
                                      const rank = userStates[shift.hr_id]?.rank || null;

                                      cumulativeIndex++; // Increment the cumulative index for each shift
                                      return (
                                        <tr
                                          key={shift.id} // Apply fade-in class dynamically
                                          className={`${isLoaded ? 'fade-in' : ''}`}
                                        >
                                          <td className="relative py-2 pr-6 w-4/5 sm:w-1/3">
                                            <UserItemFull
                                              agent={{
                                                hr_id: shift.hr_id,
                                                agent: shift.agent,
                                              }}
                                              shift={shift}
                                              timesheets={relevantTimesheets}
                                              events={relevantEvents}
                                              isLoading={!isLoaded || isTransitioning}
                                            />
                                          </td>
                                          <td className="hidden py-2 sm:table-cell pr-6">
                                            <ShiftProgressBar
                                              shift={shift}
                                              timesheets={relevantTimesheets}
                                              events={relevantEvents}
                                              calls={relevantCalls}
                                              rank={rank}
                                              isLoading={!isLoaded || isTransitioning}
                                            />
                                          </td>
                                          <td className="py-2 text-right w-20">
                                            {!isLoaded || isTransitioning ? (
                                              <div className={`animate-pulse flex flex-col items-end rounded h-10 w-1/2 ml-auto`}>
                                                <div className="h-4 bg-gray-100 rounded-lg w-14 mb-2"></div>
                                                <div className="h-4 bg-gray-100 rounded-lg w-14"></div>
                                              </div>
                                            ) : (
                                              <div className="flex justify-end">
                                                <a
                                                  onClick={() => {
                                                    setSelectedShift({
                                                      shift,
                                                      timesheets: relevantTimesheets, // Use precomputed timesheets
                                                      events: relevantEvents, // Use precomputed events
                                                    });
                                                    setIsDrawerOpen(true);
                                                  }}
                                                  className="text-sm font-medium leading-6 text-orange-600 hover:text-orange-500 cursor-pointer"
                                                >
                                                  View<span className="hidden sm:inline"> shift</span>
                                                </a>
                                              </div>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </Fragment>
                                );
                              })}
                          </Fragment>
                        ));
                      })()
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DrawerOverlay
        isOpen={isDrawerOpen}
        hasBackdrop={true}
        slideFrom={"right"}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedShift?.shift?.agent
            ? selectedShift.shift.agent
            : new Date(selectedShift?.shift?.shiftstart) > new Date()
            ? "Upcoming Shift"
            : "Previous Shift"
        }
        subTitle={
          selectedShift
            ? (() => {
                const startHour = Math.floor(selectedShift.shift.shiftstart / 100);
                const startMinute = selectedShift.shift.shiftstart % 100;
                const endHour = Math.floor(selectedShift.shift.shiftend / 100);
                const endMinute = selectedShift.shift.shiftend % 100;

                const startDate = new Date();
                startDate.setHours(startHour, startMinute);

                const endDate = new Date();
                endDate.setHours(endHour, endMinute);

                return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
              })()
            : ""
        }
      >
        <ShiftView
          selectedShift={selectedShift}
        />
      </DrawerOverlay>
      </div>
    </UtilisationTargetsProvider>
  );
}
