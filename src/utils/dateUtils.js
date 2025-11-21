/**
 * Calculates the inclusive number of days between two date strings (yyyy-mm-dd).
 * Returns 0 if start date is invalid or after end date.
 * Returns 1 if start date equals end date (single day event).
 */
export const calculateDurationDays = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) {
        return 0;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Reset times to midnight to ensure calculation is purely based on dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Calculate time difference in milliseconds
    const timeDiff = endDate.getTime() - startDate.getTime();

    if (timeDiff < 0) {
        return 0; // End date is before start date
    }

    // Convert to days (milliseconds / seconds / minutes / hours)
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Add 1 day because the duration is inclusive (e.g., Mon to Mon is 7 days, not 6)
    return dayDiff + 1;
};

// Calculates the current academic year range (e.g., "2025-26")
export const getCurrentAcademicYear = () => {
    const today = new Date();
    // Assuming academic year starts in March (Month 2 in JS, 0-indexed)
    const currentYear = today.getFullYear();
    let startYear, endYear;

    if (today.getMonth() >= 2) { // March (2) through December (11)
        startYear = currentYear;
        endYear = currentYear + 1;
    } else { // January (0) or February (1) belong to the previous academic year
        startYear = currentYear - 1;
        endYear = currentYear;
    }

    return `${startYear}-${String(endYear).slice(2)}`;
};

export const getAcademicYearOptions = (count = 4) => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed (0=Jan, 2=March)
    const currentYear = today.getFullYear();

    // Determine the start year of the Current Academic Year (CAY)
    // If we are in Jan or Feb (month < 2), the academic year started in the previous calendar year.
    // If we are in March or later (month >= 2), the academic year started in the current calendar year.
    let cayStartYear = currentMonth >= 2 ? currentYear : currentYear - 1;

    let options = [];

    for (let i = 0; i < count; i++) {
        const startYear = cayStartYear - i;
        const endYear = startYear + 1;
        options.push(`${startYear}-${String(endYear).slice(2)}`);
    }

    return options;
};
