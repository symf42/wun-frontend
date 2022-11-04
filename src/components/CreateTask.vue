<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/userStore.js'
import { useRouter } from 'vue-router'
import Datepicker from 'flowbite-datepicker/Datepicker';
import axios from 'axios';
import { Base64 } from 'js-base64';
import qs from 'qs'


const userStore = useUserStore();

const { email, password } = storeToRefs(userStore);

const router = useRouter();

onMounted(() => {
    console.log("Create Task mounted.");

    const datepickerEl = document.getElementById('task_deadline_date');
    state.datepicker = new Datepicker(datepickerEl, {
        format: 'dd.mm.yyyy',
    });

})

onUnmounted(() => {
    console.log("Create Task unmounted.");
})

defineProps({})

const colors = [
    { name: 'blue', altName: 'info', color: 'blue', styleObject: { 'text-blue-200': true, 'focus:ring-blue-200': true, 'dark:focus:ring-blue-300': true }},
    { name: 'red', altName: 'danger', color: 'red', styleObject: { 'text-red-200': true, 'focus:ring-red-200': true, 'dark:focus:ring-red-300': true }},
    { name: 'green', altName: 'success', color: 'green', styleObject: { 'text-green-200': true, 'focus:ring-green-200': true, 'dark:focus:ring-green-300': true }},
    { name: 'yellow', altName: 'warning', color: 'yellow', styleObject: { 'text-yellow-200': true, 'focus:ring-yellow-200': true, 'dark:focus:ring-yellow-300': true }},
    { name: 'dark', altName: 'dark', color: 'gray', styleObject: { 'text-gray-200': true, 'focus:ring-gray-200': true, 'dark:focus:ring-gray-300': true }},
];

const state = reactive({
    datepicker: null,
    title: "",
    description: "",
    deadlineTime: null,
    color: null,
});

function cancel() {
    router.push("/tasks")
}

function create() {
    console.log(state.title, state.description, state.datepicker.getDate("yyyy-mm-dd"), state.deadlineTime, state.color)

    let data = {
        "title": state.title,
        "description": state.description,
        "deadline": state.datepicker.getDate("yyyy-mm-dd") + " " + state.deadlineTime,
        "color": state.color,
    };

    axios.postForm(
        import.meta.env.VITE_AXIOS_BASE_URL + "/task", data, {
        headers: {
            Authorization: 'Basic ' + Base64.btoa(email.value + ":" + password.value),
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
    .then(function (response) {
        router.push("/tasks")
    })
    .catch(function (error) {
        console.log(error)
    });
}

</script>

<template>

    <div>
        <div class="flex justify-center h-screen bg-gray-900 overflow-y-scroll">
            <div class="basis-8/12">

                <h1 class="my-6 text-2xl font-bold text-slate-200">Create Task</h1>

                <div class="relative">
                    <input v-model="state.title" type="text" id="task_title" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="task_title" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Title</label>
                </div>

                <div class="relative mt-4">
                    <textarea v-model="state.description" rows="4" type="text" id="task_description" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "></textarea>
                    <label for="task_description" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/4 peer-placeholder-shown:top-1/4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Description</label>
                </div>

                <div class="relative mt-4">
                    <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input id="task_deadline_date" datepicker type="text" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Deadline date">
                </div>

                <div class="relative mt-4">
                    <input v-model="state.deadlineTime" type="text" id="task_deadline_time" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="task_deadline_time" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Deadline time (hh:mm:ss)</label>
                </div>

                <div class="flex flex-wrap my-8">
                    <div v-for="c in colors" class="flex items-center mr-4">
                        <input v-model="state.color" :id="c.color + '-radio'" type="radio" :value="c.altName" name="colored-radio" :class="c.styleObject" class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label :for="c.color + '-radio'" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ c.name }}</label>
                    </div>
                </div>

                <button @click="cancel" type="submit" class="mt-4 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Cancel</button>
                <button @click="create" type="submit" class="ml-4 mt-4 text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Create</button>

            </div>
        </div>
    </div>
</template>

<style scoped></style>
