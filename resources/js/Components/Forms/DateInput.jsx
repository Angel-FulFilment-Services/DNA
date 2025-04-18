import { Fragment, useState } from 'react';
import Datepicker from "react-tailwindcss-datepicker"; 

export default function DateInput(props) {
  const { startDateId, endDateId, label, autoComplete, placeholder, annotation, dateRange, showShortcuts, minDate, maxDate, currentState, onDateChange, onBlur, error, clearErrors } = props;
  
  const handleDateChange = (event) => {   
    if (dateRange) {
      onDateChange([{id: startDateId, value: event.startDate}, {id: endDateId, value: event.endDate}]);
    }else{
      onDateChange([{id: endDateId, value: event.endDate}]);
    }
    if (clearErrors) clearErrors(); // Clear errors when a valid date is selected
  }

  return (
    <div>
      <label htmlFor={startDateId} className="block text-sm font-medium leading-6 text-gray-900">
        {label}
        { annotation &&
          <span className='text-neutral-500 font-normal'> {annotation} </span>
        }
      </label>
      <div className={ label || annotation ? `mt-2` : ``}>
          <div className={`flex rounded-md shadow-sm ring-1 ring-inset ${error ? "ring-red-600 text-red-800" : "ring-gray-300"} focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-600 bg-white sm:max-w-md cursor-pointer`}>
            <Datepicker
              startWeekOn="mon"
              readOnly={true}
              id={startDateId}
              displayFormat="DD/MM/YYYY"
              primaryColor={"orange"} 
              separator="-"
              inputClassName={`border-0 bg-transparent py-1.5 pl-3 ${error ? "text-red-800" : "text-gray-900"} placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-none cursor-pointer z-40`}
              minDate={minDate} 
              maxDate={maxDate} 
              placeholder={placeholder}
              useRange={false} 
              asSingle={!dateRange} 
              showShortcuts={showShortcuts}
              value={currentState} 
              onChange={handleDateChange} 
              onBlur={ e => { if(onBlur) onBlur([id]);}}
              configs={{
                shortcuts: {
                  today: 'Today',
                  yesterday: 'Yesterday',
                  thisWeek: {
                    text: "This Week",
                    period: {
                      start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)), // Start of the current week (Monday)
                      end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)), // End of the current week (Sunday)
                    },
                  },
                  pastWeek: {
                    text: "Last Week",
                    period: {
                      start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 6)), // Start of the previous week (Monday)
                      end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // End of the previous week (Sunday)
                    },
                  },
                  currentMonth: 'This Month',
                  pastMonth: 'Last Month',
                  past: (period) => `Last ${period} days`,
                  thisPayroll: {
                    text: "This Payroll",
                    period: {
                      start: (() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        return today.getDate() >= 29
                          ? new Date(currentYear, currentMonth, 29) // Start from the 29th of the current month
                          : new Date(currentYear, currentMonth - 1, 29); // Start from the 29th of the previous month
                      })(),
                      end: (() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        return today.getDate() >= 29
                          ? new Date(currentYear, currentMonth + 1, 28) // End on the 28th of the next month
                          : new Date(currentYear, currentMonth, 28); // End on the 28th of the current month
                      })(),
                    },
                  },
                  lastPayroll: {
                    text: "Last Payroll",
                    period: {
                      start: (() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        return today.getDate() >= 29
                          ? new Date(currentYear, currentMonth - 1, 29) // Start from the 29th of the previous month
                          : new Date(currentYear, currentMonth - 2, 29); // Start from the 29th of two months ago
                      })(),
                      end: (() => {
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        return today.getDate() >= 29
                          ? new Date(currentYear, currentMonth, 28) // End on the 28th of the current month
                          : new Date(currentYear, currentMonth - 1, 28); // End on the 28th of the previous month
                      })(),
                    },
                  },
                },
              }}
            /> 
          </div>
          {error && <div className="text-red-600 text-sm pt-2">{error.message}</div>}
      </div>
    </div>
  );
}
