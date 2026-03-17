import { ref } from "vue";

const state = ref({
  price: null,
  getPrice: null,
});

const useProject = () => {
  return state;
};

export default useProject;
