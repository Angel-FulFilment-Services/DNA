import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useFetchEvents = (startDate, endDate) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null); // Ref to store the debounce timeout
  const latestDates = useRef({ startDate, endDate }); // Ref to store the latest startDate and endDate

  const fetchEvents = async (controller) => {
    let loadingTimeout;

    try {
      loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 3000);

      const response = await axios.get('/rota/events', {
        params: { start_date: latestDates.current.startDate, end_date: latestDates.current.endDate },
        signal: controller.signal, // Attach the AbortController signal
      });

      clearTimeout(loadingTimeout);
      setIsLoading(false);
      setEvents(response.data);
    } catch (error) {
      clearTimeout(loadingTimeout);
      setIsLoading(false);

      // Ignore abort errors
      if (axios.isCancel(error)) {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching events:', error);
      }
    }
  };

  useEffect(() => {
    // Update the latestDates ref whenever startDate or endDate changes
    latestDates.current = { startDate, endDate };
  }, [startDate, endDate]);

  useEffect(() => {
    const controller = new AbortController(); // Create a new AbortController for each fetch

    // Debounce the fetchEvents call
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchEvents(controller);
    }, 300); // Debounce delay of 300ms

    // Cleanup function
    return () => {
      controller.abort(); // Cancel the ongoing request
      clearTimeout(debounceTimeout.current); // Clear the debounce timeout
    };
  }, [startDate, endDate]); // Re-run when startDate or endDate changes

  useEffect(() => {
    // Listen for the custom "refreshEvents" event
    const handleRefresh = () => {
      const controller = new AbortController();
      fetchEvents(controller);
    };
    window.addEventListener('refreshEvents', handleRefresh);

    return () => {
      window.removeEventListener('refreshEvents', handleRefresh); // Clean up listener
    };
  }, []);

  useEffect(() => {
    // Fetch events every 60 seconds
    const intervalId = setInterval(() => {
      const controller = new AbortController();
      fetchEvents(controller);
    }, 60000); // 60-second interval

    return () => {
      clearInterval(intervalId); // Clear the interval on cleanup
    };
  }, [startDate, endDate]); // Re-run when startDate or endDate changes

  return { events, isLoading };
};

export default useFetchEvents;