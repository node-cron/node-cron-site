<template>
    <div>
        <h1>Getting Started</h1>
        <p>
            The node-cron module is tiny task scheduler in pure JavaScript for node.js 
            based on GNU crontab. This module allows you to schedule task in node.js using 
            full crontab syntax.
        </p>

        <p>
            Install node-cron using npm:
            <span class="code-inline">$ npm install --save node-cron</span>
        </p>
        <p>
            Import node-cron and schedule a task:
            <code>
                <pre class="code">
var cron = require('node-cron');

cron.schedule('* * * * *', () => {
console.log('running a task every minute');
});
                </pre>  
            </code>
        </p>
        <p>
            See the <router-link to="/docs/cron-syntax">cron syntax</router-link> tho create diferent expressions for jobs scheduling.
        </p>
    </div>
</template>
