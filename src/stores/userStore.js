import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {

    const email = ref(useLocalStorage("wun_user_email", ""))
    const password = ref(null)

    return { email, password }

})
