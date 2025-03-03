import { Fragment, useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import SelectControl from '../Controls/SelectControl';
import CycleControl from '../Controls/CycleControl';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { getOrdinalSuffix } from '../../Utils/Date';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MenuComponent({ currentView, setView, handleNextTimeframe, handlePreviousTimeframe, currentDate }) {
  const [views, setViews] = useState([
    { id: 'day', value: 'Day', displayValue: 'Day view' },
    { id: 'week', value: 'Week', displayValue: 'Week view' },
    { id: 'list', value: 'List', displayValue: 'List view' },
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setViews((prevViews) => prevViews.filter(view => view.value !== 'Week'));
      } else {
        setViews((prevViews) => {
          if (!prevViews.some(view => view.value === 'Week')) {
            const newViews = [...prevViews];
            newViews.splice(1, 0, { id: 'week', value: 'Week', displayValue: 'Week view' });
            return newViews;
          }
          return prevViews;
        });
      }
    };

    // Check window size on initial load
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelectChange = (selected) => {
    setView(selected.value);
  };

  const defaultSelected = views.find(view => view.value.toLowerCase() === currentView.toLowerCase());

  const day = format(currentDate, 'd');
  const ordinalSuffix = getOrdinalSuffix(day);

  const formattedDate = currentView === 'Day'
    ? `${format(currentDate, 'MMMM')} ${day}${ordinalSuffix}, ${format(currentDate, 'yyyy')}`
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMMM')} ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd')}${getOrdinalSuffix(format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd'))}${format(startOfWeek(currentDate, { weekStartsOn: 1 }), ', yyyy')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMMM')} ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd')}${getOrdinalSuffix(format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd'))}${format(endOfWeek(currentDate, { weekStartsOn: 1 }), ', yyyy')}`;

  const formattedDay = currentView === 'Day'
    ? `${format(currentDate, 'EEEE')}`
    : '';

  const cycleControlDate = currentView === 'Day'
    ? format(currentDate, 'MMM dd, yyyy')
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM dd')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM dd, yyyy')}`;

  return (
    <div className="w-full flex sm:flex-row justify-between gap-x-2">
      <div className="w-full">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={format(currentDate, 'yyyy-MM-dd')} className="sm:hidden">
            {formattedDate}
          </time>
          <time dateTime={format(currentDate, 'yyyy-MM-dd')} className="hidden sm:inline">
            {formattedDate}
          </time>
        </h1>
        {currentView === 'Day' && (
          <p className="mt-1 text-sm text-gray-500">{formattedDay}</p>
        )}
        {currentView === 'Week' && (
          <p className="mt-1 text-sm text-gray-500 h-5">{formattedDay}</p>
        )}
        {currentView === 'List' && (
          <p className="mt-1 text-sm text-gray-500 h-5">{formattedDay}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end w-full gap-y-2 sm:gap-x-2">
        <div className="w-56 sm:w-36">
          <SelectControl
            id="view-select"
            items={views}
            onSelectChange={handleSelectChange}
            placeholder={`${currentView} view`}
            defaultSelected={defaultSelected}
          />
        </div>

        <div className="w-56">
          <CycleControl
              id="timeframe-cycle"
              currentValue={cycleControlDate}
              onNext={handleNextTimeframe}
              onPrevious={handlePreviousTimeframe}
          />
        </div>
      </div>
    </div>
  );
}