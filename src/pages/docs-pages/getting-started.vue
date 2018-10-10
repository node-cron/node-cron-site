<template>
    <div>
        <h2>Getting Started</h2>
        <p>
            Install node-cron using npm:
            <span class="code-inline">$ npm install --save node-cron</span>
        </p>
        <p>
            Import node-cron and schedule a task:
            <pre>
                <code>
var cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
});
                </code>
            </pre>  
        </p>
    </div>
</template>
