<script setup>
import { reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Base64 } from 'js-base64';
import Datepicker from 'flowbite-datepicker/Datepicker';
import axios from 'axios';
import moment from 'moment';
import { XCircleIcon, PlusCircleIcon, ArrowPathIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { useUserStore } from '../stores/userStore.js';

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

const colors = [
  { name: 'blue', altName: 'info', color: 'blue', styleObject: { 'text-blue-200': true, 'focus:ring-blue-200': true, 'dark:focus:ring-blue-300': true }},
  { name: 'red', altName: 'danger', color: 'red', styleObject: { 'text-red-200': true, 'focus:ring-red-200': true, 'dark:focus:ring-red-300': true }},
  { name: 'green', altName: 'success', color: 'green', styleObject: { 'text-green-200': true, 'focus:ring-green-200': true, 'dark:focus:ring-green-300': true }},
  { name: 'yellow', altName: 'warning', color: 'yellow', styleObject: { 'text-yellow-200': true, 'focus:ring-yellow-200': true, 'dark:focus:ring-yellow-300': true }},
  { name: 'dark', altName: 'dark', color: 'gray', styleObject: { 'text-gray-200': true, 'focus:ring-gray-200': true, 'dark:focus:ring-gray-300': true }},
];

const state = reactive({
  tasks: [],
  interval: null,
  popupModal: null,
  popupModalSelectedTaskId: null,
  popupModalSelectedTaskTitle: null,
  createTaskModal: null,
  createTaskModalDatepicker: null,
  createTaskModalValues: {
    title: "",
    description: "",
    deadlineTime: "",
    color: "",
  },
});

function openCreateTaskModal() {
  // set the modal menu element
  const targetEl = document.getElementById('create-task-modal');
  // options with default values
  const options = {
    placement: 'center-center',
    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    onHide: () => { console.log('create task modal is hidden'); },
    onShow: () => { console.log('create task modal is shown'); },
    onToggle: () => { console.log('create task modal has been toggled'); },
  };
  // create and open the create task modal
  state.createTaskModal = new Modal(targetEl, options);
  state.createTaskModal.show();
  // create the datepicker element
  const datepickerEl = document.getElementById('task_deadline_date');
  state.createTaskModalDatepicker = new Datepicker(datepickerEl, {
    format: 'dd.mm.yyyy',
  });
}

function createTask() {
  // create the request object
  let data = {
    "title": state.createTaskModalValues.title,
    "description": state.createTaskModalValues.description,
    "deadline": state.createTaskModalDatepicker.getDate("yyyy-mm-dd") + " " + state.createTaskModalValues.deadlineTime,
    "color": state.createTaskModalValues.color,
  };
  // create task
  axios.postForm(
    import.meta.env.VITE_AXIOS_BASE_URL + "/task", data, {
    headers: {
      Authorization: 'Basic ' + Base64.btoa(email.value + ":" + password.value),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(function (response) {
      router.push("/tasks")
  }).catch(function (error) {
      console.log(error)
  });
  // close the create task modal
  closeCreateTaskModal();
}

function closeCreateTaskModal() {
  const datepickerEl = document.getElementById('task_deadline_date');
  datepickerEl.value = "";
  state.createTaskModal.hide();
  state.createTaskModal = null;
  state.createTaskModalDatepicker = null;
  state.createTaskModalValues = {
    title: "",
    description: "",
    deadlineTime: "",
    color: "",
  };
}

function openPopupModal(taskId, taskTitle) {
  // save the selected task information
  state.popupModalSelectedTaskId = taskId;
  state.popupModalSelectedTaskTitle = taskTitle;
  // set the modal menu element
  const targetEl = document.getElementById('popup-modal');
  // options with default values
  const options = {
    placement: 'center-center',
    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    onHide: () => { console.log('popup modal is hidden'); },
    onShow: () => { console.log('popup modal is shown'); },
    onToggle: () => { console.log('popup modal has been toggled'); },
  };
  // create and open the popup modal
  state.popupModal = new Modal(targetEl, options);
  state.popupModal.show();
}

function closePopupModal() {
  state.popupModalSelectedTaskId = null;
  state.popupModalSelectedTaskTitle = null;
  state.popupModal.hide();
  state.popupModal = null;
}

function deleteTask() {
  // delete the currently selected task
  axios.delete(
    import.meta.env.VITE_AXIOS_BASE_URL + "/task", {
      data: {
        taskId: state.popupModalSelectedTaskId,
      },
      headers: {
        Authorization: 'Basic ' + Base64.btoa(email.value + ":" + password.value)
      }
  }).then(function (response) {
    console.log("Task deleted.")
  }).catch(function (error) {
    console.log(error)
  });
  // reload the tasks to update the ui
  loadTasks();
  // close the popup modal
  closePopupModal();
}

function loadTasks() {
  axios.get(
    import.meta.env.VITE_AXIOS_BASE_URL + "/tasks", {
      headers: {
        Authorization: 'Basic ' + Base64.btoa(email.value + ":" + password.value)
      }
  }).then(function (response) {
    let tasks = response.data.map(t => {
      t.alertColor = 'alert-' + t.color;
      t.deadline = moment(t.dueDateTime);
      t.deadlineWeekdayString = t.deadline.format("dddd");
      t.deadlineString = t.deadline.format("DD.MM.YYYY HH:mm");
      t.deadlineDiff = t.deadline.diff(moment(), "seconds");
      t.deadlineDiffDays = Math.floor(t.deadlineDiff / 86400);
      t.deadlineDiffHours = Math.floor((t.deadlineDiff % 86400) / 3600);
      t.deadlineDiffMinutes = Math.floor(((t.deadlineDiff % 86400) % 3600) / 60);
      t.deadlineDiffSeconds = (((t.deadlineDiff % 86400) % 3600) % 60);
      t.deadlineDiffSecondsDelta = t.deadlineDiff - t.durationInSeconds;
      t.firstOfMonth = false;
      return t;
    });

    let m = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    let cy = moment().year();
    let y = [cy - 3, cy - 2, cy - 1, cy, cy + 1, cy + 2];

    y.forEach((y) => {
      m.forEach((m) => {
        let t = tasks.find((t) => {
          return t.deadline.isSame("" + y + "-" + m + "-01", "month");
        });
        if (t !== undefined) {
          t.firstOfMonth = true;
        }
      });
    });

    state.tasks = tasks;

  }).catch(function (error) {
    // logout on error
    password.value = null;
    router.push("/");
  });
}

</script>

<template>
  <div class="flex justify-center h-screen overflow-y-scroll">
    <div class="basis-8/12">

      <div class="flex justify-between">
        <div>
          <h1 class="mt-6 text-2xl font-bold text-slate-200">What's up next?</h1>
        </div>
        <div class="mt-6">
          <button @click="" type="button" class="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            <TrashIcon class="w-5 h-5 mr-2" /> Trash
          </button>
          <button @click="loadTasks" type="button" class="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            <ArrowPathIcon class="w-5 h-5 mr-2" /> Reload
          </button>
          <button @click="openCreateTaskModal" type="button" class="text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            <PlusCircleIcon class="w-5 h-5 mr-2" /> Create task
          </button>
        </div>
      </div>

      <div id="popup-modal" tabindex="-1" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
        <div class="relative p-4 w-full max-w-md h-full md:h-auto">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-800">
            <button @click="closePopupModal()" type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="popup-modal">
              <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              <span class="sr-only">Close modal</span>
            </button>
            <div class="p-6 text-center">
              <ExclamationCircleIcon class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" />
              <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete task `{{ state.popupModalSelectedTaskTitle }}`?
              </h3>
              <button @click="deleteTask()" data-modal-toggle="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                Delete
              </button>
              <button @click="closePopupModal()" data-modal-toggle="popup-modal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create task modal -->
      <div id="create-task-modal" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
        <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
          <!-- Create task content -->
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-800">
            <button @click="closeCreateTaskModal" type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal">
              <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              <span class="sr-only">Close modal</span>
            </button>
            <div class="py-6 px-6 lg:px-8">
              <h3 class="mb-8 text-xl font-medium text-gray-900 dark:text-white">
                Create Task
              </h3>
              <form class="space-y-2" action="#">
                  
                <div class="relative">
                    <input v-model="state.createTaskModalValues.title" type="text" id="task_title" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="task_title" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Title</label>
                </div>

                <div class="relative">
                    <textarea v-model="state.createTaskModalValues.description" rows="4" type="text" id="task_description" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "></textarea>
                    <label for="task_description" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/4 peer-placeholder-shown:top-1/4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Description</label>
                </div>

                <div class="relative">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input id="task_deadline_date" datepicker type="text" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Deadline date">
                </div>

                <div class="relative">
                    <input v-model="state.createTaskModalValues.deadlineTime" type="text" id="task_deadline_time" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="task_deadline_time" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Deadline time (hh:mm:ss)</label>
                </div>

                <div class="flex flex-wrap">
                    <div v-for="c in colors" class="flex items-center my-4 mr-4">
                        <input v-model="state.createTaskModalValues.color" :id="c.color + '-radio'" type="radio" :value="c.altName" name="colored-radio" :class="c.styleObject" class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label :for="c.color + '-radio'" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ c.name }}</label>
                    </div>
                </div>

                <button @click="createTask" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                  Create task
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-for="t in state.tasks" key="t.taskId">
        <h2 v-if="t.firstOfMonth" class="mt-12 mb-4 text-lg font-bold text-slate-400">{{ t.deadline.format("MMMM") }} - {{ t.deadline.format("yyyy") }}</h2>
        <div :class="t.alertColor" role="alert">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6"><span class="font-bold">{{t.title}}</span></div>
            <div class="col-span-5">
              <div class="flex flex-wrap">
                <div class="flex-initial w-24">{{ t.deadlineWeekdayString }}</div>
                <div class="flex-initial w-36"><span class="font-bold">{{ t.deadlineString }}</span></div>
                <div class="">{{ t.deadlineDiffDays }}d {{ t.deadlineDiffHours }}h {{ t.deadlineDiffMinutes }}m {{ t.deadlineDiffSeconds }}s</div>
              </div>
            </div>
            <div class="col-span-1">
              <div class="flex justify-end">
                <XCircleIcon @click="openPopupModal(t.taskId, t.title)" class="h-5 w-5 mr-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped></style>
