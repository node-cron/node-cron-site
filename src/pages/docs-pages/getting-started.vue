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
        <p>
            See the <router-link to="/docs#cron-syntax">cron syntax</router-link> tho create diferent expressions for jobs scheduling.
        </p>
    </div>
</template>
