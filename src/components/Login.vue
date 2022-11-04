<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/userStore.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore();

const { email, password } = storeToRefs(userStore);

const router = useRouter();

onMounted(() => {
    console.log("Login mounted.");
})

onUnmounted(() => {
    console.log("Login unmounted.");
})

defineProps({})

const state = reactive({
    email: email.value,
    password: password.value,
});

function login() {
    email.value = state.email;
    password.value = state.password;
    router.push("/tasks")
}

</script>

<template>

    <div>
        <div class="flex justify-center h-screen bg-gray-900 overflow-y-scroll">
            <div class="basis-8/12">

                <h1 class="my-6 text-2xl font-bold text-slate-200">Login</h1>

                <div class="relative">
                    <input v-model="state.email" type="text" id="email_floating" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="email_floating" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Email</label>
                </div>

                <div class="relative mt-4 mb-4">
                    <input v-model="state.password" type="password" id="password_floating" class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" ">
                    <label for="password_floating" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Password</label>
                </div>

                <button @click="login" type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>

            </div>
        </div>
    </div>
</template>

<style scoped></style>
