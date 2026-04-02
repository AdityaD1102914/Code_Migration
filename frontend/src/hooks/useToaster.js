import { useToasterContext } from '../contexts/ToasterContext';

const useToaster = () => {
  const { addToast } = useToasterContext();

  const showSuccessToast = (message, duration) => {
    addToast('success', message, duration);
  };

  const showErrorToast = (message, duration) => {
    addToast('error', message, duration);
  };

  const showWarningToast = (message, duration) => {
    addToast('warning', message, duration);
  };

  const showInfoToast = (message, duration) => {
    addToast('info', message, duration);
  };

  return {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
};

export default useToaster;