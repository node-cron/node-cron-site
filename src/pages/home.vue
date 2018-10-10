<template>
    <page-layout>
      <div>
        <div class="slogan">
          <container>
            <h1>A simple cron-like job scheduler for Node.js</h1>
            <demo></demo>
            <router-link to="/docs" class="btn btn-primary btn-large">Getting Started</router-link>
          </container>
        </div>
      </div>
    </page-layout>
</template>

<script>
import PageLayout from '../layouts/page-layout.vue';
import Container from '../components/container.vue';
import Demo from '../components/demo.vue';

export default {
  components: {
    PageLayout,
    Container,
    Demo
  }
}
</script>

<style lang="scss">
  .slogan {
    text-align: center;
    height: 100%;
    margin-top: 100px;

    button {
      margin-top: 30px;
    }
  }
</style>

