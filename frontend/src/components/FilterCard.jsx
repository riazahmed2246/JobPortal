import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';

const filterData = [
  {
    filterType: 'Location',
    array: ['Dhaka', 'Sylhet', 'Khulna', 'Rangpur', 'Rajshahi'],
  },
  {
    filterType: 'Industry',
    array: ['Frontend Developer', 'Backend Developer', 'FullStack Developer', 'Mobile App Developer', 'Graphic Designer'],
  },
  {
    filterType: 'Salary',
    array: ['0-40k', '41-80k', '81k-120k'],
  },
];

const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const dispatch = useDispatch();

  const changeHandler = (value) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue));
  }, [selectedValue, dispatch]);

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Filter Jobs</h1>
      <RadioGroup value={selectedValue} onValueChange={changeHandler} className="space-y-6">
        {filterData.map((section, sectionIdx) => (
          <div key={section.filterType}>
            <h2 className="text-md font-medium text-gray-700 mb-2">{section.filterType}</h2>
            <div className="space-y-2">
              {section.array.map((item, itemIdx) => {
                const itemId = `radio-${sectionIdx}-${itemIdx}`;
                return (
                  <div key={itemId} className="flex items-center space-x-2">
                    <RadioGroupItem value={item} id={itemId} />
                    <Label htmlFor={itemId} className="text-sm text-gray-600">{item}</Label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
