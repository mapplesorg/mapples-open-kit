import useFormContext from './useFormContext';

const useFormSubmit = () => {
  const { submitting, submitForm } = useFormContext();

  return {
    submitting,
    submitForm,
  };
};

export default useFormSubmit;
