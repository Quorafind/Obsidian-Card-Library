import React from 'react';
import { Input, InputProps } from '@/components/ui/input'; // assuming the Input component is in the same directory

interface SearchBarProps extends InputProps {
    id?: string;
    placeholder?: string;
    onSearch?: (value: string) => void;
}

const Search: React.FC<SearchBarProps> = ({
                                              id,
                                              placeholder,
                                              onSearch,
                                              className,
                                              ...props
                                          }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onSearch) {
            onSearch(event.currentTarget.value);
        }
    };

    return (
        <Input
            id={id}
            placeholder={placeholder}
            type="search"
            onKeyDown={handleKeyDown}
            className={className}
            {...props}
        />
    );
};

export { Search };
