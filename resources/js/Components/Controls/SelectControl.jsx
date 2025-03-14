import { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SelectInput(props) {
  const { id, items, onSelectChange, placeholder, defaultSelected, label } = props;
  
  const [selected, setSelected] = useState(defaultSelected || items[0]);

  useEffect(() => {
    if (defaultSelected) {
      setSelected(defaultSelected);
    }
  }, [defaultSelected]);

  const handleSelectChange = (event) => {
    setSelected(event);
    onSelectChange({ id: id, value: event.value });
  };

  return (
    <Listbox key={id} value={selected} onChange={handleSelectChange}>
      {({ open }) => (
        <div className="w-full">
          {label && <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900 mb-2">{label}</Listbox.Label>}
          <div className="relative w-full">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6">
              <span className={`block truncate ${!selected.value && "text-gray-400"}`}>
                {selected.displayValue ? selected.displayValue : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {items.map((item) => (
                  <Listbox.Option
                    key={item.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {item.displayValue}
                        </span>
                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-gray-900' : 'text-orange-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}

SelectInput.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    displayValue: PropTypes.string.isRequired,
  })).isRequired,
  onSelectChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  defaultSelected: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    displayValue: PropTypes.string.isRequired,
  }),
  label: PropTypes.string,
};

SelectInput.defaultProps = {
  placeholder: 'Select an option',
  defaultSelected: null,
  label: null,
};
