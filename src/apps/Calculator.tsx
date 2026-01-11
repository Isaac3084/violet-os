import React, { useState, useEffect, useCallback } from 'react';

// Currency rates cache
interface CurrencyRates {
  rates: { [key: string]: number };
  lastUpdated: string;
}

// Unit conversion types
type ConversionCategory =
  | 'currency' | 'length' | 'area' | 'volume' | 'weight'
  | 'temperature' | 'speed' | 'pressure' | 'power' | 'number' | 'emi'
  | 'tip' | 'age' | 'bmi' | 'percentage' | 'date';

// Category icons using Lucide-style SVG paths
const CategoryIcons: { [key: string]: React.ReactNode } = {
  currency: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9h6M9 15h6" />
    </svg>
  ),
  length: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12h20M6 8v8M18 8v8" />
    </svg>
  ),
  area: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  volume: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  weight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 18L18 6M6 6l12 12" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  temperature: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  speed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  pressure: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  power: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  number: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9h16M4 15h16M10 3v18M14 3v18" />
    </svg>
  ),
  emi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  tip: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
    </svg>
  ),
  age: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  bmi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v8M8 12h8M9 21l3-5 3 5" />
    </svg>
  ),
  percentage: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 18L18 6" />
    </svg>
  ),
  date: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  ),
};

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  // Unit Converter States
  const [showConverter, setShowConverter] = useState(false);
  const [converterCategory, setConverterCategory] = useState<ConversionCategory>('length');
  const [converterFromUnit, setConverterFromUnit] = useState('');
  const [converterToUnit, setConverterToUnit] = useState('');
  const [converterFromValue, setConverterFromValue] = useState('1');
  const [converterResult, setConverterResult] = useState('');
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // EMI Calculator States
  const [emiPrincipal, setEmiPrincipal] = useState('100000');
  const [emiRate, setEmiRate] = useState('10');
  const [emiTenure, setEmiTenure] = useState('12');
  const [emiResult, setEmiResult] = useState<{ emi: number, totalInterest: number, totalPayment: number } | null>(null);

  // Tip Calculator States
  const [tipBillAmount, setTipBillAmount] = useState('100');
  const [tipPercentage, setTipPercentage] = useState('15');
  const [tipSplitCount, setTipSplitCount] = useState('1');

  // Age Calculator States
  const [ageBirthDate, setAgeBirthDate] = useState('');
  const [ageResult, setAgeResult] = useState<{ years: number, months: number, days: number } | null>(null);

  // BMI Calculator States
  const [bmiWeight, setBmiWeight] = useState('70');
  const [bmiHeight, setBmiHeight] = useState('170');
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');

  // Percentage Calculator States
  const [percValue, setPercValue] = useState('100');
  const [percPercentage, setPercPercentage] = useState('25');
  const [percMode, setPercMode] = useState<'of' | 'increase' | 'decrease' | 'whatperc'>('of');

  // Date Difference States
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // UX States
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Conversion data
  const conversionUnits: { [key in ConversionCategory]: { name: string; units: { [key: string]: { name: string; factor: number } } } } = {
    currency: {
      name: 'Currency',
      units: {
        USD: { name: 'US Dollar', factor: 1 },
        EUR: { name: 'Euro', factor: 0.85 },
        GBP: { name: 'British Pound', factor: 0.73 },
        INR: { name: 'Indian Rupee', factor: 83.12 },
        JPY: { name: 'Japanese Yen', factor: 149.50 },
        AUD: { name: 'Australian Dollar', factor: 1.53 },
        CAD: { name: 'Canadian Dollar', factor: 1.36 },
        CHF: { name: 'Swiss Franc', factor: 0.88 },
        CNY: { name: 'Chinese Yuan', factor: 7.24 },
        KRW: { name: 'Korean Won', factor: 1320.50 },
      }
    },
    length: {
      name: 'Length',
      units: {
        m: { name: 'Meter', factor: 1 },
        km: { name: 'Kilometer', factor: 0.001 },
        cm: { name: 'Centimeter', factor: 100 },
        mm: { name: 'Millimeter', factor: 1000 },
        mi: { name: 'Mile', factor: 0.000621371 },
        yd: { name: 'Yard', factor: 1.09361 },
        ft: { name: 'Foot', factor: 3.28084 },
        in: { name: 'Inch', factor: 39.3701 },
        nm: { name: 'Nautical Mile', factor: 0.000539957 },
      }
    },
    area: {
      name: 'Area',
      units: {
        'm2': { name: 'Square Meter', factor: 1 },
        'km2': { name: 'Square Kilometer', factor: 0.000001 },
        'cm2': { name: 'Square Centimeter', factor: 10000 },
        'ha': { name: 'Hectare', factor: 0.0001 },
        'acre': { name: 'Acre', factor: 0.000247105 },
        'ft2': { name: 'Square Foot', factor: 10.7639 },
        'yd2': { name: 'Square Yard', factor: 1.19599 },
        'mi2': { name: 'Square Mile', factor: 3.861e-7 },
      }
    },
    volume: {
      name: 'Volume',
      units: {
        'L': { name: 'Liter', factor: 1 },
        'mL': { name: 'Milliliter', factor: 1000 },
        'm3': { name: 'Cubic Meter', factor: 0.001 },
        'gal': { name: 'Gallon (US)', factor: 0.264172 },
        'qt': { name: 'Quart', factor: 1.05669 },
        'pt': { name: 'Pint', factor: 2.11338 },
        'cup': { name: 'Cup', factor: 4.22675 },
        'fl_oz': { name: 'Fluid Ounce', factor: 33.814 },
        'tbsp': { name: 'Tablespoon', factor: 67.628 },
        'tsp': { name: 'Teaspoon', factor: 202.884 },
      }
    },
    weight: {
      name: 'Weight',
      units: {
        'kg': { name: 'Kilogram', factor: 1 },
        'g': { name: 'Gram', factor: 1000 },
        'mg': { name: 'Milligram', factor: 1000000 },
        'lb': { name: 'Pound', factor: 2.20462 },
        'oz': { name: 'Ounce', factor: 35.274 },
        't': { name: 'Metric Ton', factor: 0.001 },
        'st': { name: 'Stone', factor: 0.157473 },
      }
    },
    temperature: {
      name: 'Temperature',
      units: {
        'C': { name: 'Celsius', factor: 1 },
        'F': { name: 'Fahrenheit', factor: 1 },
        'K': { name: 'Kelvin', factor: 1 },
      }
    },
    speed: {
      name: 'Speed',
      units: {
        'mps': { name: 'Meters/Second', factor: 1 },
        'kmph': { name: 'Kilometers/Hour', factor: 3.6 },
        'mph': { name: 'Miles/Hour', factor: 2.23694 },
        'knot': { name: 'Knots', factor: 1.94384 },
        'fps': { name: 'Feet/Second', factor: 3.28084 },
        'mach': { name: 'Mach', factor: 0.00291545 },
      }
    },
    pressure: {
      name: 'Pressure',
      units: {
        'Pa': { name: 'Pascal', factor: 1 },
        'kPa': { name: 'Kilopascal', factor: 0.001 },
        'bar': { name: 'Bar', factor: 0.00001 },
        'psi': { name: 'PSI', factor: 0.000145038 },
        'atm': { name: 'Atmosphere', factor: 9.8692e-6 },
        'mmHg': { name: 'mm Mercury', factor: 0.00750062 },
      }
    },
    power: {
      name: 'Power',
      units: {
        'W': { name: 'Watt', factor: 1 },
        'kW': { name: 'Kilowatt', factor: 0.001 },
        'MW': { name: 'Megawatt', factor: 0.000001 },
        'hp': { name: 'Horsepower', factor: 0.00134102 },
        'BTU_h': { name: 'BTU/hour', factor: 3.41214 },
        'cal_s': { name: 'Calories/Second', factor: 0.239006 },
      }
    },
    number: {
      name: 'Number System',
      units: {
        'dec': { name: 'Decimal', factor: 10 },
        'bin': { name: 'Binary', factor: 2 },
        'oct': { name: 'Octal', factor: 8 },
        'hex': { name: 'Hexadecimal', factor: 16 },
      }
    },
    emi: {
      name: 'EMI Calculator',
      units: {}
    },
    tip: {
      name: 'Tip Calculator',
      units: {}
    },
    age: {
      name: 'Age Calculator',
      units: {}
    },
    bmi: {
      name: 'BMI Calculator',
      units: {}
    },
    percentage: {
      name: 'Percentage',
      units: {}
    },
    date: {
      name: 'Date Difference',
      units: {}
    }
  };

  // Initialize default units when category changes
  useEffect(() => {
    const units = Object.keys(conversionUnits[converterCategory].units);
    if (units.length >= 2) {
      setConverterFromUnit(units[0]);
      setConverterToUnit(units[1]);
    }
  }, [converterCategory]);

  // Fetch currency rates
  const fetchCurrencyRates = async () => {
    setCurrencyLoading(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      setCurrencyRates({
        rates: data.rates,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
      setCurrencyRates({
        rates: {
          USD: 1, EUR: 0.85, GBP: 0.73, INR: 83.12, JPY: 149.50,
          AUD: 1.53, CAD: 1.36, CHF: 0.88, CNY: 7.24, KRW: 1320.50
        },
        lastUpdated: 'Using cached rates'
      });
    }
    setCurrencyLoading(false);
  };

  useEffect(() => {
    fetchCurrencyRates();
  }, []);

  // Convert temperature
  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = value;
    if (from === 'F') celsius = (value - 32) * 5 / 9;
    else if (from === 'K') celsius = value - 273.15;

    if (to === 'C') return celsius;
    if (to === 'F') return celsius * 9 / 5 + 32;
    if (to === 'K') return celsius + 273.15;
    return value;
  };

  // Convert number systems
  const convertNumberSystem = (value: string, from: string, to: string): string => {
    try {
      let decimal: number;
      switch (from) {
        case 'bin': decimal = parseInt(value, 2); break;
        case 'oct': decimal = parseInt(value, 8); break;
        case 'hex': decimal = parseInt(value, 16); break;
        default: decimal = parseInt(value, 10);
      }

      if (isNaN(decimal)) return 'Invalid';

      switch (to) {
        case 'bin': return decimal.toString(2);
        case 'oct': return decimal.toString(8);
        case 'hex': return decimal.toString(16).toUpperCase();
        default: return decimal.toString(10);
      }
    } catch {
      return 'Error';
    }
  };

  // Perform conversion
  useEffect(() => {
    if (converterCategory === 'emi') return;
    if (!converterFromUnit || !converterToUnit || !converterFromValue) {
      setConverterResult('');
      return;
    }

    const value = parseFloat(converterFromValue);
    if (isNaN(value)) {
      setConverterResult('Invalid input');
      return;
    }

    if (converterCategory === 'temperature') {
      const result = convertTemperature(value, converterFromUnit, converterToUnit);
      setConverterResult(result.toFixed(4));
      return;
    }

    if (converterCategory === 'number') {
      const result = convertNumberSystem(converterFromValue, converterFromUnit, converterToUnit);
      setConverterResult(result);
      return;
    }

    if (converterCategory === 'currency' && currencyRates) {
      const fromRate = currencyRates.rates[converterFromUnit] || 1;
      const toRate = currencyRates.rates[converterToUnit] || 1;
      const result = (value / fromRate) * toRate;
      setConverterResult(result.toFixed(4));
      return;
    }

    const units = conversionUnits[converterCategory].units;
    const fromFactor = units[converterFromUnit]?.factor || 1;
    const toFactor = units[converterToUnit]?.factor || 1;
    const baseValue = value / fromFactor;
    const result = baseValue * toFactor;
    setConverterResult(result.toFixed(6));
  }, [converterFromValue, converterFromUnit, converterToUnit, converterCategory, currencyRates]);

  // Calculate EMI
  useEffect(() => {
    const P = parseFloat(emiPrincipal);
    const R = parseFloat(emiRate) / 12 / 100;
    const N = parseFloat(emiTenure);

    if (isNaN(P) || isNaN(R) || isNaN(N) || P <= 0 || N <= 0) {
      setEmiResult(null);
      return;
    }

    if (R === 0) {
      const emi = P / N;
      setEmiResult({ emi, totalInterest: 0, totalPayment: P });
      return;
    }

    const emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    setEmiResult({ emi, totalInterest, totalPayment });
  }, [emiPrincipal, emiRate, emiTenure]);

  // Calculate Tip
  const [tipResult, setTipResult] = useState<{ tipAmount: number, totalAmount: number, perPerson: number } | null>(null);
  useEffect(() => {
    const bill = parseFloat(tipBillAmount);
    const tip = parseFloat(tipPercentage);
    const split = parseFloat(tipSplitCount);

    if (isNaN(bill) || isNaN(tip) || isNaN(split) || split <= 0) {
      setTipResult(null);
      return;
    }

    const tipAmount = bill * (tip / 100);
    const totalAmount = bill + tipAmount;
    const perPerson = totalAmount / split;

    setTipResult({ tipAmount, totalAmount, perPerson });
  }, [tipBillAmount, tipPercentage, tipSplitCount]);

  // Calculate Age
  useEffect(() => {
    if (!ageBirthDate) return;
    const birth = new Date(ageBirthDate);
    const today = new Date();

    if (isNaN(birth.getTime())) return;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    setAgeResult({ years, months, days });
  }, [ageBirthDate]);

  // Calculate BMI
  const [bmiResult, setBmiResult] = useState<{ bmi: number, status: string } | null>(null);
  useEffect(() => {
    const weight = parseFloat(bmiWeight);
    const height = parseFloat(bmiHeight);

    if (isNaN(weight) || isNaN(height) || height === 0) {
      setBmiResult(null);
      return;
    }

    let bmi = 0;
    if (bmiUnit === 'metric') {
      // Weight in kg, height in cm
      bmi = weight / Math.pow(height / 100, 2);
    } else {
      // Weight in lb, height in inches
      bmi = 703 * weight / Math.pow(height, 2);
    }

    let status = '';
    if (bmi < 18.5) status = 'Underweight';
    else if (bmi < 25) status = 'Normal weight';
    else if (bmi < 30) status = 'Overweight';
    else status = 'Obese';

    setBmiResult({ bmi, status });
  }, [bmiWeight, bmiHeight, bmiUnit]);

  // Calculate Percentage
  const [percResult, setPercResult] = useState<string>('');
  useEffect(() => {
    const val = parseFloat(percValue);
    const perc = parseFloat(percPercentage);

    if (isNaN(val) || isNaN(perc)) {
      setPercResult('');
      return;
    }

    let res = 0;
    switch (percMode) {
      case 'of':
        res = (perc / 100) * val;
        break;
      case 'increase':
        res = val * (1 + perc / 100);
        break;
      case 'decrease':
        res = val * (1 - perc / 100);
        break;
      case 'whatperc':
        if (perc === 0) res = 0;
        else res = (val / perc) * 100;
        break;
    }
    setPercResult(res.toString());
  }, [percValue, percPercentage, percMode]);

  // Calculate Date Difference
  const [dateResult, setDateResult] = useState<{ days: number, weeks: number, months: number, years: number } | null>(null);
  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    const d1 = new Date(dateFrom);
    const d2 = new Date(dateTo);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Approximate
    const years = Math.floor(days / 365.25);
    const months = Math.floor(days / 30.44);
    const weeks = Math.floor(days / 7);

    setDateResult({ days, weeks, months, years });
  }, [dateFrom, dateTo]);

  const playSound = () => {
    if (!soundEnabled) return;
    // Simple beep using AudioContext
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.value = 0.1;

      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 50);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setExpression(expression + num);
      setWaitingForNewValue(false);
    } else {
      const newDisplay = display === '0' ? num : display + num;
      setDisplay(newDisplay);
      if (display === '0') {
        setExpression(expression.slice(0, -1) + num);
      } else {
        setExpression(expression + num);
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setExpression(expression + '0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);
    const operatorSymbol = nextOperation === '×' ? ' × ' : nextOperation === '÷' ? ' ÷ ' : ` ${nextOperation} `;

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(display + operatorSymbol);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(String(newValue) + operatorSymbol);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return secondValue !== 0 ? firstValue / secondValue : NaN;
      case '^': return Math.pow(firstValue, secondValue);
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const resultDisplay = Number.isNaN(newValue) ? 'Error' : String(newValue);
      const historyEntry = `${expression}${display} = ${resultDisplay}`;

      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      setDisplay(resultDisplay);
      setExpression('');
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const toggleSign = () => {
    const newValue = parseFloat(display) * -1;
    setDisplay(String(newValue));
  };

  const percentage = () => {
    const newValue = parseFloat(display) / 100;
    setDisplay(String(newValue));
  };

  // Scientific functions
  const squareRoot = () => {
    const value = parseFloat(display);
    const result = Math.sqrt(value);
    setDisplay(String(result));
    setHistory(prev => [`√${value} = ${result}`, ...prev.slice(0, 19)]);
  };

  const square = () => {
    const value = parseFloat(display);
    const result = Math.pow(value, 2);
    setDisplay(String(result));
    setHistory(prev => [`${value}² = ${result}`, ...prev.slice(0, 19)]);
  };

  const cube = () => {
    const value = parseFloat(display);
    const result = Math.pow(value, 3);
    setDisplay(String(result));
    setHistory(prev => [`${value}³ = ${result}`, ...prev.slice(0, 19)]);
  };

  const reciprocal = () => {
    const value = parseFloat(display);
    const result = 1 / value;
    setDisplay(String(result));
    setHistory(prev => [`1/${value} = ${result}`, ...prev.slice(0, 19)]);
  };

  const factorial = () => {
    const value = parseInt(display);
    if (value < 0 || value > 170) {
      setDisplay('Error');
      return;
    }
    let result = 1;
    for (let i = 2; i <= value; i++) result *= i;
    setDisplay(String(result));
    setHistory(prev => [`${value}! = ${result}`, ...prev.slice(0, 19)]);
  };

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const sin = () => {
    const value = parseFloat(display);
    const angle = angleMode === 'deg' ? toRadians(value) : value;
    setDisplay(String(Math.sin(angle)));
  };

  const cos = () => {
    const value = parseFloat(display);
    const angle = angleMode === 'deg' ? toRadians(value) : value;
    setDisplay(String(Math.cos(angle)));
  };

  const tan = () => {
    const value = parseFloat(display);
    const angle = angleMode === 'deg' ? toRadians(value) : value;
    setDisplay(String(Math.tan(angle)));
  };

  const log = () => {
    const value = parseFloat(display);
    const result = Math.log10(value);
    setDisplay(String(result));
    setHistory(prev => [`log(${value}) = ${result}`, ...prev.slice(0, 19)]);
  };

  const ln = () => {
    const value = parseFloat(display);
    const result = Math.log(value);
    setDisplay(String(result));
    setHistory(prev => [`ln(${value}) = ${result}`, ...prev.slice(0, 19)]);
  };

  const exp = () => {
    const value = parseFloat(display);
    const result = Math.exp(value);
    setDisplay(String(result));
    setHistory(prev => [`e^${value} = ${result}`, ...prev.slice(0, 19)]);
  };

  const pi = () => setDisplay(String(Math.PI));
  const euler = () => setDisplay(String(Math.E));

  // Memory functions
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => setDisplay(String(memory));
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));

  // Keyboard support
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (showConverter) return;

    const key = e.key;
    setPressedKey(key);
    playSound(); // Play sound on key press
    setTimeout(() => setPressedKey(null), 100);

    if (/[0-9]/.test(key)) inputNumber(key);
    else if (key === '.') inputDecimal();
    else if (key === '+') performOperation('+');
    else if (key === '-') performOperation('-');
    else if (key === '*') performOperation('×');
    else if (key === '/') { e.preventDefault(); performOperation('÷'); }
    else if (key === 'Enter' || key === '=') performCalculation();
    else if (key === 'Escape' || key === 'c' || key === 'C') clear();
    else if (key === 'Backspace') backspace();
    else if (key === '%') percentage();
  }, [display, expression, previousValue, operation, waitingForNewValue, showConverter, soundEnabled]); // Added soundEnabled

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const formatDisplay = (value: string) => {
    if (value === 'Error' || value === 'NaN' || value === 'Infinity') return value;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return value;
    if (value.length > 12) return num.toExponential(6);
    return value;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const Button = ({ onClick, className = '', children, keyTrigger }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    keyTrigger?: string;
  }) => (
    <button
      className={`calc-btn ${className} ${pressedKey === keyTrigger ? 'pressed' : ''}`}
      onClick={() => {
        playSound();
        onClick();
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .calc-wrapper {
          height: 100%;
          background: #0a0a0f;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .calc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          background: #12121a;
          border-bottom: 1px solid #1e1e2d;
        }
        
        .calc-title {
          font-size: 12px;
          font-weight: 600;
          color: #e0e0e0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .calc-title-icon {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calc-title-icon svg {
          width: 10px;
          height: 10px;
          stroke: white;
        }
        
        .header-btns {
          display: flex;
          gap: 4px;
        }
        
        .header-btn {
          background: #1e1e2d;
          border: 1px solid #2d2d3d;
          border-radius: 6px;
          padding: 4px 8px;
          color: #a0a0b0;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .header-btn:hover {
          background: #2d2d3d;
          color: #e0e0e0;
        }
        
        .header-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .header-btn svg {
          width: 10px;
          height: 10px;
        }
        
        .calc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 8px;
          gap: 8px;
          overflow: hidden;
          position: relative;
        }
        
        .display-area {
          background: #12121a;
          border: 1px solid #1e1e2d;
          border-radius: 12px;
          padding: 14px;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        .expression {
          font-size: 11px;
          color: #606080;
          text-align: right;
          min-height: 14px;
          margin-bottom: 2px;
        }
        
        .display {
          font-size: 32px;
          font-weight: 600;
          color: #ffffff;
          text-align: right;
          line-height: 1.1;
        }
        
        .display.error {
          color: #ef4444;
        }
        
        .memory-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 9px;
          color: #3b82f6;
          font-weight: 600;
          background: rgba(59, 130, 246, 0.15);
          padding: 2px 6px;
          border-radius: 4px;
          display: ${memory !== 0 ? 'block' : 'none'};
        }
        
        .buttons-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(${isScientific ? 5 : 4}, 1fr);
          gap: 4px;
        }
        
        .calc-btn {
          border: none;
          border-radius: 10px;
          font-size: ${isScientific ? '11px' : '16px'};
          font-weight: 500;
          cursor: pointer;
          transition: all 0.1s ease;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: ${isScientific ? '36px' : '42px'};
          background: #1e1e2d;
          color: #e0e0e0;
          border: 1px solid #2d2d3d;
        }
        
        .calc-btn:hover {
          background: #2d2d3d;
          border-color: #3d3d4d;
        }
        
        .calc-btn:active,
        .calc-btn.pressed {
          transform: scale(0.96);
          background: #3d3d4d;
        }
        
        .calc-btn.operator {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .calc-btn.operator:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
        
        .calc-btn.function {
          background: #1a1a25;
          color: #8b8ba0;
          font-size: ${isScientific ? '10px' : '13px'};
        }
        
        .calc-btn.function:hover {
          background: #2d2d3d;
          color: #e0e0e0;
        }
        
        .calc-btn.equals {
          background: #3b82f6;
          color: white;
          font-size: 20px;
          border-color: #3b82f6;
        }
        
        .calc-btn.equals:hover {
          background: #2563eb;
        }
        
        .calc-btn.zero {
          grid-column: span 2;
        }
        
        .calc-btn.scientific {
          font-size: 10px;
          background: #151520;
          color: #7090ff;
          border-color: #252540;
        }
        
        .calc-btn.scientific:hover {
          background: #1e1e30;
          color: #90b0ff;
        }
        
        .calc-btn.memory {
          font-size: 9px;
          background: #151520;
          color: #60a0ff;
          border-color: #252540;
        }
        
        .calc-btn.memory:hover {
          background: #1e1e30;
        }
        
        /* Side Panels */
        .panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0a0a0f;
          z-index: 10;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.25s ease;
        }
        
        .panel.open {
          transform: translateX(0);
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #12121a;
          border-bottom: 1px solid #1e1e2d;
        }
        
        .panel-title {
          font-size: 13px;
          font-weight: 600;
          color: #e0e0e0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .panel-close {
          background: #1e1e2d;
          border: 1px solid #2d2d3d;
          border-radius: 6px;
          width: 24px;
          height: 24px;
          color: #a0a0b0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .panel-close:hover {
          background: #2d2d3d;
          color: #e0e0e0;
        }
        
        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        
        /* History */
        .history-item {
          padding: 10px 12px;
          margin-bottom: 6px;
          background: #12121a;
          border: 1px solid #1e1e2d;
          border-left: 3px solid #3b82f6;
          border-radius: 8px;
          font-size: 11px;
          color: #c0c0d0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .history-item:hover {
          background: #1e1e2d;
          border-left-color: #60a5fa;
        }
        
        .history-empty {
          text-align: center;
          color: #505060;
          font-size: 12px;
          margin-top: 40px;
        }
        
        /* Converter */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          margin-bottom: 10px;
        }
        
        .category-btn {
          background: #12121a;
          border: 1px solid #1e1e2d;
          border-radius: 8px;
          padding: 8px 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          font-family: inherit;
          color: #8080a0;
        }
        
        .category-btn:hover {
          background: #1e1e2d;
          color: #a0a0c0;
        }
        
        .category-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .category-btn svg {
          width: 14px;
          height: 14px;
        }
        
        .category-name {
          font-size: 7px;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }
        
        .converter-form {
          background: #12121a;
          border: 1px solid #1e1e2d;
          border-radius: 10px;
          padding: 12px;
        }
        
        .converter-row {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          align-items: center;
        }
        
        .converter-label {
          font-size: 10px;
          font-weight: 500;
          color: #606080;
          min-width: 35px;
        }
        
        .converter-input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #2d2d3d;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          background: #0a0a0f;
          color: #e0e0e0;
        }
        
        .converter-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .converter-select {
          padding: 8px 10px;
          border: 1px solid #2d2d3d;
          border-radius: 8px;
          font-size: 11px;
          font-family: inherit;
          background: #0a0a0f;
          color: #e0e0e0;
          cursor: pointer;
          min-width: 90px;
        }
        
        .converter-select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .swap-btn {
          background: #3b82f6;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
          margin: 4px auto;
        }
        
        .swap-btn:hover {
          transform: rotate(180deg);
          background: #2563eb;
        }
        
        .result-box {
          background: #3b82f6;
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          margin-top: 8px;
        }
        
        .result-value {
          font-size: 16px;
          font-weight: 700;
          color: white;
        }
        
        .result-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }
        
        .currency-info {
          font-size: 9px;
          color: #505060;
          text-align: center;
          margin-top: 8px;
        }
        
        .refresh-link {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 9px;
          margin-left: 4px;
        }
        
        /* EMI */
        .emi-form {
          background: #12121a;
          border: 1px solid #1e1e2d;
          border-radius: 10px;
          padding: 12px;
        }
        
        .emi-field {
          margin-bottom: 10px;
        }
        
        .emi-label {
          font-size: 10px;
          font-weight: 500;
          color: #606080;
          margin-bottom: 4px;
          display: block;
        }
        
        .emi-input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #2d2d3d;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          background: #0a0a0f;
          color: #e0e0e0;
          box-sizing: border-box;
        }
        
        .emi-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .emi-results {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin-top: 12px;
        }
        
        .emi-card {
          background: #1e1e2d;
          border: 1px solid #2d2d3d;
          border-radius: 8px;
          padding: 10px 8px;
          text-align: center;
        }
        
        .emi-card.highlight {
          grid-column: span 2;
          background: #3b82f6;
          border-color: #3b82f6;
        }
        
        .emi-card-value {
          font-size: 14px;
          font-weight: 700;
          color: white;
        }
        
        .emi-card-label {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }
        
        .emi-card:not(.highlight) .emi-card-value {
          color: #e0e0e0;
        }
        
        .emi-card:not(.highlight) .emi-card-label {
          color: #606080;
        }
      `}</style>

      <div className="calc-wrapper">
        <div className="calc-header">
          <div className="calc-title">
            <span className="calc-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
              </svg>
            </span>
            Calculator
          </div>
          <div className="header-btns">
            <button
              className={`header-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  // Play a test beep immediately when enabling
                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.frequency.value = 800;
                  gain.gain.value = 0.1;
                  osc.start();
                  setTimeout(() => { osc.stop(); ctx.close(); }, 50);
                }
              }}
              title="Toggle Sound"
            >
              {soundEnabled ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>
            <button
              className={`header-btn ${showKeyboardHelp ? 'active' : ''}`}
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              title="Keyboard Shortcuts"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M6 16h.001M10 16h.001M14 16h.001M18 16h.001" />
              </svg>
            </button>
            <button
              className={`header-btn ${isScientific ? 'active' : ''}`}
              onClick={() => setIsScientific(!isScientific)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 9h16M4 15h16M10 3v18M14 3v18" />
              </svg>
              {isScientific ? 'Sci' : 'Basic'}
            </button>
            <button
              className="header-btn"
              onClick={() => { setShowHistory(true); setShowConverter(false); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </button>
            <button
              className={`header-btn ${showConverter ? 'active' : ''}`}
              onClick={() => { setShowConverter(true); setShowHistory(false); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Convert
            </button>
          </div>
        </div>

        <div className="calc-body">
          <div className="memory-badge">M = {memory}</div>

          <div className="display-area">
            <div className="expression">{expression}</div>
            <div className={`display ${display === 'Error' || display === 'NaN' ? 'error' : ''}`}>
              {formatDisplay(display)}
            </div>
          </div>

          <div className="buttons-grid">
            {isScientific && (
              <>
                <Button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="scientific">
                  {angleMode.toUpperCase()}
                </Button>
                <Button onClick={sin} className="scientific">sin</Button>
                <Button onClick={cos} className="scientific">cos</Button>
                <Button onClick={tan} className="scientific">tan</Button>
                <Button onClick={pi} className="scientific">π</Button>

                <Button onClick={squareRoot} className="scientific">√</Button>
                <Button onClick={square} className="scientific">x²</Button>
                <Button onClick={cube} className="scientific">x³</Button>
                <Button onClick={() => performOperation('^')} className="scientific">xʸ</Button>
                <Button onClick={euler} className="scientific">e</Button>

                <Button onClick={log} className="scientific">log</Button>
                <Button onClick={ln} className="scientific">ln</Button>
                <Button onClick={exp} className="scientific">eˣ</Button>
                <Button onClick={factorial} className="scientific">n!</Button>
                <Button onClick={reciprocal} className="scientific">1/x</Button>

                <Button onClick={memoryClear} className="memory">MC</Button>
                <Button onClick={memoryRecall} className="memory">MR</Button>
                <Button onClick={memoryAdd} className="memory">M+</Button>
                <Button onClick={memorySubtract} className="memory">M-</Button>
                <Button onClick={backspace} className="function">⌫</Button>
              </>
            )}

            {/* Standard calculator layout - operators on right column */}
            {/* Row 1: AC, +/−, %, ÷ (+ extra in sci mode) */}
            <Button onClick={clear} className="function" keyTrigger="Escape">AC</Button>
            <Button onClick={toggleSign} className="function">+/−</Button>
            <Button onClick={percentage} className="function" keyTrigger="%">%</Button>
            {isScientific && <Button onClick={() => setExpression(expression + '(')} className="function">(</Button>}
            <Button onClick={() => performOperation('÷')} className="operator" keyTrigger="/">÷</Button>

            {/* Row 2: 7, 8, 9, × */}
            <Button onClick={() => inputNumber('7')} keyTrigger="7">7</Button>
            <Button onClick={() => inputNumber('8')} keyTrigger="8">8</Button>
            <Button onClick={() => inputNumber('9')} keyTrigger="9">9</Button>
            {isScientific && <Button onClick={() => setExpression(expression + ')')} className="function">)</Button>}
            <Button onClick={() => performOperation('×')} className="operator" keyTrigger="*">×</Button>

            {/* Row 3: 4, 5, 6, − */}
            <Button onClick={() => inputNumber('4')} keyTrigger="4">4</Button>
            <Button onClick={() => inputNumber('5')} keyTrigger="5">5</Button>
            <Button onClick={() => inputNumber('6')} keyTrigger="6">6</Button>
            {isScientific && <Button onClick={backspace} className="function">⌫</Button>}
            <Button onClick={() => performOperation('-')} className="operator" keyTrigger="-">−</Button>

            {/* Row 4: 1, 2, 3, + */}
            <Button onClick={() => inputNumber('1')} keyTrigger="1">1</Button>
            <Button onClick={() => inputNumber('2')} keyTrigger="2">2</Button>
            <Button onClick={() => inputNumber('3')} keyTrigger="3">3</Button>
            {isScientific && <Button onClick={() => inputNumber('00')}>00</Button>}
            <Button onClick={() => performOperation('+')} className="operator" keyTrigger="+">+</Button>

            {/* Row 5: 0, ., = */}
            <Button onClick={() => inputNumber('0')} className={isScientific ? '' : 'zero'} keyTrigger="0">0</Button>
            {isScientific && <Button onClick={() => inputNumber('000')}>000</Button>}
            <Button onClick={inputDecimal} keyTrigger=".">.</Button>
            {isScientific && <Button onClick={clear} className="function">C</Button>}
            <Button onClick={performCalculation} className="equals" keyTrigger="Enter">=</Button>
          </div>

          {/* History Panel */}
          <div className={`panel ${showHistory ? 'open' : ''}`}>
            <div className="panel-header">
              <span className="panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                History
              </span>
              <button className="panel-close" onClick={() => setShowHistory(false)}>×</button>
            </div>
            <div className="panel-body">
              {history.length === 0 ? (
                <div className="history-empty">No calculations yet</div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    className="history-item"
                    onClick={() => {
                      const result = item.split(' = ')[1];
                      if (result && result !== 'Error') {
                        setDisplay(result);
                        setShowHistory(false);
                      }
                    }}
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Converter Panel */}
          <div className={`panel ${showConverter ? 'open' : ''}`}>
            <div className="panel-header">
              <span className="panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                Unit Converter
              </span>
              <button className="panel-close" onClick={() => setShowConverter(false)}>×</button>
            </div>
            <div className="panel-body">
              <div className="category-grid">
                {(Object.keys(conversionUnits) as ConversionCategory[]).map(cat => (
                  <button
                    key={cat}
                    className={`category-btn ${converterCategory === cat ? 'active' : ''}`}
                    onClick={() => setConverterCategory(cat)}
                  >
                    {CategoryIcons[cat]}
                    <span className="category-name">{conversionUnits[cat].name}</span>
                  </button>
                ))}
              </div>

              {converterCategory === 'emi' ? (
                <div className="emi-form">
                  <div className="emi-field">
                    <label className="emi-label">Principal Amount</label>
                    <input type="number" className="emi-input" value={emiPrincipal} onChange={e => setEmiPrincipal(e.target.value)} placeholder="Enter loan amount" />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Interest Rate (% per year)</label>
                    <input type="number" className="emi-input" value={emiRate} onChange={e => setEmiRate(e.target.value)} placeholder="Annual interest rate" step="0.1" />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Tenure (months)</label>
                    <input type="number" className="emi-input" value={emiTenure} onChange={e => setEmiTenure(e.target.value)} placeholder="Loan tenure in months" />
                  </div>

                  {emiResult && (
                    <div className="emi-results">
                      <div className="emi-card highlight">
                        <div className="emi-card-value">₹{formatCurrency(emiResult.emi)}</div>
                        <div className="emi-card-label">Monthly EMI</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">₹{formatCurrency(emiResult.totalInterest)}</div>
                        <div className="emi-card-label">Total Interest</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">₹{formatCurrency(emiResult.totalPayment)}</div>
                        <div className="emi-card-label">Total Payment</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : converterCategory === 'tip' ? (
                <div className="emi-form">
                  <div className="emi-field">
                    <label className="emi-label">Bill Amount</label>
                    <input type="number" className="emi-input" value={tipBillAmount} onChange={e => setTipBillAmount(e.target.value)} />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Tip Percentage (%)</label>
                    <input type="number" className="emi-input" value={tipPercentage} onChange={e => setTipPercentage(e.target.value)} />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Number of People</label>
                    <input type="number" className="emi-input" value={tipSplitCount} onChange={e => setTipSplitCount(e.target.value)} />
                  </div>
                  {tipResult && (
                    <div className="emi-results">
                      <div className="emi-card highlight">
                        <div className="emi-card-value">${formatCurrency(tipResult.totalAmount)}</div>
                        <div className="emi-card-label">Total Bill</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">${formatCurrency(tipResult.tipAmount)}</div>
                        <div className="emi-card-label">Tip Amount</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">${formatCurrency(tipResult.perPerson)}</div>
                        <div className="emi-card-label">Per Person</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : converterCategory === 'age' ? (
                <div className="emi-form">
                  <div className="emi-field">
                    <label className="emi-label">Date of Birth</label>
                    <input type="date" className="emi-input" value={ageBirthDate} onChange={e => setAgeBirthDate(e.target.value)} />
                  </div>
                  {ageResult && (
                    <div className="emi-results">
                      <div className="emi-card highlight">
                        <div className="emi-card-value">{ageResult.years} Years</div>
                        <div className="emi-card-label">{ageResult.months} Months, {ageResult.days} Days</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">{Math.floor((ageResult.years * 12) + ageResult.months)}</div>
                        <div className="emi-card-label">Total Months</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">~{Math.floor(ageResult.years * 365.25 + ageResult.months * 30.4 + ageResult.days)}</div>
                        <div className="emi-card-label">Total Days</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : converterCategory === 'bmi' ? (
                <div className="emi-form">
                  <div className="emi-field" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button className={`header-btn ${bmiUnit === 'metric' ? 'active' : ''}`} onClick={() => setBmiUnit('metric')}>Metric (kg/cm)</button>
                    <button className={`header-btn ${bmiUnit === 'imperial' ? 'active' : ''}`} onClick={() => setBmiUnit('imperial')}>Imperial (lb/in)</button>
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Weight ({bmiUnit === 'metric' ? 'kg' : 'lbs'})</label>
                    <input type="number" className="emi-input" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">Height ({bmiUnit === 'metric' ? 'cm' : 'inches'})</label>
                    <input type="number" className="emi-input" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} />
                  </div>
                  {bmiResult && (
                    <div className="emi-results">
                      <div className="emi-card highlight">
                        <div className="emi-card-value">{bmiResult.bmi.toFixed(1)}</div>
                        <div className="emi-card-label">BMI Score</div>
                      </div>
                      <div className="emi-card" style={{ gridColumn: 'span 2', background: bmiResult.status === 'Normal weight' ? '#10b981' : bmiResult.status === 'Overweight' ? '#f59e0b' : '#ef4444' }}>
                        <div className="emi-card-value">{bmiResult.status}</div>
                        <div className="emi-card-label">Category</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : converterCategory === 'percentage' ? (
                <div className="emi-form">
                  <div className="emi-field">
                    <label className="emi-label">Calculation Mode</label>
                    <select className="converter-select" value={percMode} onChange={(e: any) => setPercMode(e.target.value)} style={{ width: '100%' }}>
                      <option value="of">% of Value</option>
                      <option value="increase">Increase by %</option>
                      <option value="decrease">Decrease by %</option>
                      <option value="whatperc">What % is X of Y</option>
                    </select>
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">{percMode === 'whatperc' ? 'Part Value (X)' : 'Percentage (%)'}</label>
                    <input type="number" className="emi-input" value={percPercentage} onChange={e => setPercPercentage(e.target.value)} />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">{percMode === 'whatperc' ? 'Total Value (Y)' : 'Value'}</label>
                    <input type="number" className="emi-input" value={percValue} onChange={e => setPercValue(e.target.value)} />
                  </div>
                  {percResult && (
                    <div className="result-box">
                      <div className="result-value">{percResult}{percMode === 'whatperc' ? '%' : ''}</div>
                      <div className="result-label">Result</div>
                    </div>
                  )}
                </div>
              ) : converterCategory === 'date' ? (
                <div className="emi-form">
                  <div className="emi-field">
                    <label className="emi-label">From Date</label>
                    <input type="date" className="emi-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  </div>
                  <div className="emi-field">
                    <label className="emi-label">To Date</label>
                    <input type="date" className="emi-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  </div>
                  {dateResult && (
                    <div className="emi-results">
                      <div className="emi-card highlight">
                        <div className="emi-card-value">{dateResult.days}</div>
                        <div className="emi-card-label">Total Days</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">{dateResult.weeks}</div>
                        <div className="emi-card-label">Weeks</div>
                      </div>
                      <div className="emi-card">
                        <div className="emi-card-value">{dateResult.years}y {dateResult.months % 12}m</div>
                        <div className="emi-card-label">Approx Duration</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="converter-form">
                  <div className="converter-row">
                    <span className="converter-label">From</span>
                    <input
                      type={converterCategory === 'number' ? 'text' : 'number'}
                      className="converter-input"
                      value={converterFromValue}
                      onChange={e => setConverterFromValue(e.target.value)}
                      placeholder="Enter value"
                    />
                    <select
                      className="converter-select"
                      value={converterFromUnit}
                      onChange={e => setConverterFromUnit(e.target.value)}
                    >
                      {Object.entries(conversionUnits[converterCategory].units).map(([key, unit]) => (
                        <option key={key} value={key}>{unit.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="swap-btn"
                    onClick={() => {
                      const temp = converterFromUnit;
                      setConverterFromUnit(converterToUnit);
                      setConverterToUnit(temp);
                    }}
                  >
                    ⇅
                  </button>

                  <div className="converter-row">
                    <span className="converter-label">To</span>
                    <div className="converter-input" style={{ background: '#12121a', cursor: 'default' }}>
                      {converterResult || '—'}
                    </div>
                    <select
                      className="converter-select"
                      value={converterToUnit}
                      onChange={e => setConverterToUnit(e.target.value)}
                    >
                      {Object.entries(conversionUnits[converterCategory].units).map(([key, unit]) => (
                        <option key={key} value={key}>{unit.name}</option>
                      ))}
                    </select>
                  </div>

                  {converterResult && (
                    <div className="result-box">
                      <div className="result-value">
                        {converterFromValue} {converterFromUnit} = {converterResult} {converterToUnit}
                      </div>
                      <div className="result-label">
                        {conversionUnits[converterCategory].units[converterFromUnit]?.name} → {conversionUnits[converterCategory].units[converterToUnit]?.name}
                      </div>
                    </div>
                  )}

                  {converterCategory === 'currency' && (
                    <div className="currency-info">
                      {currencyLoading ? 'Loading rates...' : (
                        <>
                          Last updated: {currencyRates?.lastUpdated}
                          <button className="refresh-link" onClick={fetchCurrencyRates}>Refresh</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts Help Overlay */}
          {showKeyboardHelp && (
            <div className="panel open" style={{ zIndex: 50 }}>
              <div className="panel-header">
                <span className="panel-title">⌨️ Keyboard Shortcuts</span>
                <button className="panel-close" onClick={() => setShowKeyboardHelp(false)}>×</button>
              </div>
              <div className="panel-body" style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#e0e0e0' }}>
                  <div>Numbers 0-9</div><div>Input Number</div>
                  <div>.</div><div>Decimal Point</div>
                  <div>+ - * /</div><div>Operators</div>
                  <div>Enter / =</div><div>Calculate</div>
                  <div>Esc / C</div><div>Clear All</div>
                  <div>Backspace</div><div>Delete Last</div>
                  <div>%</div><div>Percentage</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
