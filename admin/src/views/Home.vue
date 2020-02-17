<template>
  <div class="home">
    <Head />
  </div>
</template>

<script>
import Head from '@/components/Head.vue'
export default {
  name: 'home',
  components: {
    Head
  },
  mounted(){
    console.log(process.env)
  }
}
</script>
