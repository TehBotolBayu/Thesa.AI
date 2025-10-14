import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function StyledSelect({setSelectedValue}) {
  return (
        <Select.Root onValueChange={setSelectedValue} defaultValue="literature">
          <Select.Trigger className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-chatbg border border-gray-300 rounded-full text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <Select.Value placeholder="Select a fruit..." />
            <Select.Icon className="ml-2">
              <ChevronDown size={16} className="text-gray-500" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="overflow-hidden bg-chatbg rounded-lg shadow-lg border border-gray-200 w-[var(--radix-select-trigger-width)]">
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-chatbg text-gray-700 cursor-default">
                <ChevronUp size={16} />
              </Select.ScrollUpButton>
              
              <Select.Viewport className="p-1">
                <Select.Group>
                  <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Select a Mode
                  </Select.Label>
                  
                  <SelectItem value="literature">Literature Review Mode</SelectItem>
                  <SelectItem value="writer">Writer Mode</SelectItem>
                </Select.Group>
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-chatbg text-gray-700 cursor-default">
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
      className="relative flex items-center px-3 py-2 text-sm text-gray-900 rounded cursor-pointer select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900"
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-3 inline-flex items-center">
        <Check size={16} className="text-blue-600" />
      </Select.ItemIndicator>
    </Select.Item>
  );
});