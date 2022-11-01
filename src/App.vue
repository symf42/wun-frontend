<script setup>
import Tasks from './components/Tasks.vue'
import Login from './components/Login.vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from './stores/userStore.js'

const userStore = useUserStore();

const { email, password } = storeToRefs(userStore);

</script>

<template>
  <Login v-if="email === null && password === null" />
  <Tasks v-if="email !== null && password !== null" />
</template>

<style scoped></style>
