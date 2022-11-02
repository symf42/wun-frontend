<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from './stores/userStore.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore();

const { email, password } = storeToRefs(userStore);

const router = useRouter();

onMounted(() => {
  router.push("/");
})

</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
