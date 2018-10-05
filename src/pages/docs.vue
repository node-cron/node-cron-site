<template>
    <page-layout>
        <container class="docs-container">
            <div class="docs-menu-container">
                <docs-menu></docs-menu>
            </div>
            <div class="docs-content-container">
                <router-view name="docview"></router-view>
            </div>  
        </container>
    </page-layout>
</template>

<script>
import PageLayout from '../layouts/page-layout.vue';
import Container from '../components/container.vue';
import DocsMenu from '../components/docs-menu.vue';

export default {
  components: {
    PageLayout,
    Container,
    DocsMenu
  }
}
</script>

<style lang="scss">
    .docs-container {
        display: flex;
        flex-direction: row;
    }

    .docs-content-container {
        width: 100%;
    }

    .docs-menu-container {
        min-width: 30%;
        margin-top: 110px;
        margin-right: 30px;
    }
</style>
