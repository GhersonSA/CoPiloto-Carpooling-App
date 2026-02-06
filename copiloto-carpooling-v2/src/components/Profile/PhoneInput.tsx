'use client';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    prefix?: string;
    placeholder?: string;
}

const PhoneInput = ({
    value,
    onChange,
    prefix = "+34",
    placeholder = "612345678",
}: PhoneInputProps) => {

    const getNumberWithoutPrefix = (val: string) => {
        if (!val) return '';
        return val.replace(prefix, '').replace(/\s/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        const limitedDigits = digits.slice(0, 9);
        onChange(limitedDigits ? `${prefix}${limitedDigits}` : '');
    };

    return (
        <div className="flex w-full">
            <span className="inline-flex items-center px-4 text-lg font-semibold text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg shrink-0">
                {prefix}
            </span>
            <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={placeholder}
                value={getNumberWithoutPrefix(value)}
                onChange={handleChange}
                className="flex-1 min-w-0 border border-gray-300 rounded-r-lg text-lg h-12 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                maxLength={9}
            />
        </div>
    );
};

export default PhoneInput;