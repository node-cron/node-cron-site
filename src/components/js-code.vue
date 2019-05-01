<template>
    <pre>
        <code>
        <slot></slot>
        </code>
    </pre>
</template>

<script>
    import Prism from 'prismjs';
    
    export default {
        mounted (){
            let domElement = this.$el.firstElementChild;
            let code = domElement.textContent;
            const highlightedCode = Prism.highlight(
                    code,
                    Prism.languages.javascript,
                    'javascript'
                );
            
            domElement.innerHTML = highlightedCode
        }
    }
</script>