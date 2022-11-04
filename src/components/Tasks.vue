<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/userStore.js'
import { Base64 } from 'js-base64';
import { useRouter } from 'vue-router'

const router = useRouter();

const userStore = useUserStore();

const { email, password } = storeToRefs(userStore);

onMounted(() => {
  console.log("Tasks mounted.");
  // load the tasks for the first time
  loadTasks();
  // setup interval to periodically loading the tasks
  state.interval = setInterval(() => { loadTasks() }, 1000);
})

onUnmounted(() => {
  // stop the timer
  clearInterval(state.interval);
  console.log("Tasks unmounted.");
});

defineProps({})

const state = reactive({
  tasks: [],
  interval: null
});

function createTask() {
  router.push("/task/create")
}

function loadTasks() {
  axios.get(
    import.meta.env.VITE_AXIOS_BASE_URL + "/tasks", {
      headers: {
        Authorization: 'Basic ' + Base64.btoa(email.value + ":" + password.value)
      }
  })
  .then(function (response) {
    state.tasks = response.data.map(t => {
      t.alertColor = 'alert-' + t.color;
      t.deadline = moment(t.dueDateTime);
      t.deadlineString = t.deadline.format("DD.MM.YYYY HH:mm:ss");
      t.deadlineDiff = t.deadline.diff(moment(), "seconds");
      t.deadlineDiffDays = Math.floor(t.deadlineDiff / 86400);
      t.deadlineDiffHours = Math.floor((t.deadlineDiff % 86400) / 3600);
      t.deadlineDiffMinutes = Math.floor(((t.deadlineDiff % 86400) % 3600) / 60);
      t.deadlineDiffSeconds = (((t.deadlineDiff % 86400) % 3600) % 60);
      t.deadlineDiffSecondsDelta = t.deadlineDiff - t.durationInSeconds;
      return t;
    });
  })
  .catch(function (error) {
    // logout on error
    password.value = null;
    router.push("/");
  });
}

</script>

<template>
  <div class="flex justify-center h-screen bg-gray-900 overflow-y-scroll">
    <div class="basis-8/12">

      <h1 class="my-6 text-2xl font-bold text-slate-200">What's up next?</h1>

      <div v-for="t in state.tasks" :class="t.alertColor" key="t.taskId" role="alert">
        <span class="font-medium">{{t.title}}</span> - {{ t.deadlineString }} - {{ t.deadlineDiffDays }}d {{ t.deadlineDiffHours }}h {{ t.deadlineDiffMinutes }}m {{ t.deadlineDiffSeconds }}s
      </div>

      <button @click="loadTasks" type="submit" class="mt-4 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Refresh</button>
      <button @click="createTask" type="submit" class="ml-2 mt-4 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Create Task</button>

    </div>
  </div>
</template>

<style scoped></style>
