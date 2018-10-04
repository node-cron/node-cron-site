<template>
    <page-layout>
      <div>
        <div class="slogan">
          <container>
            <h1>A simple cron-like job scheduler for Node.js</h1>
            <demo></demo>
            <button class="btn btn-primary btn-large">Getting Started</button>
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
    background-color: #e6e6e6;
    padding-top: 100px;
    padding-bottom: 100px;
    height: 100%;

    h1 {
      color: green;
      font-size: 40px;
      font-weight: 100;
    }

    button {
      margin-top: 30px;
    }
  }
</style>

