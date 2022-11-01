import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {

    const email = ref(null)
    const password = ref(null)

    return { email, password }

})
