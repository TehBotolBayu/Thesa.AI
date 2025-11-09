import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function StyledSelect({placeholder, setSelectedValue, selectionList}) {

  return (
        <Select.Root onValueChange={setSelectedValue} defaultValue={selectionList[0].value}>
          <Select.Trigger className="inline-flex items-center justify-between w-full px-4 py-2 bg-white border-2 border-primary/20 rounded-lg text-sm font-medium text-primary hover:bg-gray-50 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm">
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="ml-2">
              <ChevronDown size={18} className="text-primary" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-xl shadow-xl border border-primary/20 w-[var(--radix-select-trigger-width)] animate-in fade-in-0 zoom-in-95 duration-200">
              <Select.ScrollUpButton className="flex items-center justify-center h-8 bg-white text-primary cursor-default hover:bg-gray-50">
                <ChevronUp size={16} />
              </Select.ScrollUpButton>
              
              <Select.Viewport className="p-2">
                <Select.Group>
                  <Select.Label className="px-3 py-2 text-xs font-light text-primary uppercase tracking-wider">
                    {placeholder}
                  </Select.Label>
                  {selectionList.map((item) => (
                    <SelectItem key={item.value} value={item.value} >{item.label}</SelectItem>
                  ))}
                </Select.Group>
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center h-8 bg-white text-primary cursor-default hover:bg-gray-50">
                <ChevronDown size={16} />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
  );
}

const SelectItem = React.forwardRef(({ children, value, ...props }, forwardedRef) => {
  return (
    <Select.Item
      value={value}
      ref={forwardedRef}
      className={`relative flex items-center px-4 py-3 text-sm font-medium text-primary rounded-lg whitespace-nowrap
        cursor-pointer select-none hover:bg-primary/5 focus:bg-primary/5 focus:outline-none data-[highlighted]:bg-primary/5 
        data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-50 data-[state=checked]:to-blue-50 
        data-[state=checked]:text-blue-900 transition-colors duration-150 ${props.className} nowrap`}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-4 inline-flex items-center">
        <Check size={18} className="text-blue-600" />
      </Select.ItemIndicator>
    </Select.Item>
  );
});