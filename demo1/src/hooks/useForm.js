const useForm = (initForm = { name: "", age: 0 }) => {
  import { ref } from "vue";
  const formState = ref(initForm);

  const updateField = (field, value) => {
    formState.value[field] = value;
  };
  const reset = () => {
    formState.value = initForm;
  };
};
export default useForm;
