const fs = require("fs");
const path = require("path");

class FlowEngine {
    constructor() {
        this.sessions = {};
    }

    loadFlow(flowName) {
        const flowPath = path.join(__dirname, `../Flows/${flowName}.json`);
        return JSON.parse(fs.readFileSync(flowPath, "utf-8"));
    }

    getSession(userId, flowName) {
        if (!this.sessions[userId]) {
            const flow = this.loadFlow(flowName);
            this.sessions[userId] = {
                flowName,
                currentNode: flow.start_node,
                data: {}
            };
        }
        return this.sessions[userId];
    }

    async handleMessage(userId, userMessage, flowName) {
        const flow = this.loadFlow(flowName);
        const session = this.getSession(userId, flowName);
        const currentNode = flow.nodes[session.currentNode];

        switch (currentNode.type) {
            case "info":
            session.currentNode = currentNode.next?.target || session.currentNode;
            return currentNode.message;

            case "options":
            const choice = userMessage.trim();
            const nextNodeId = currentNode.option_routes[choice];
            if (!nextNodeId) {
                return `Invalid choice. Please reply with one of: ${Object.keys(currentNode.option_routes).join(", ")}`;
            }
            session.data[currentNode.data_key] = choice;
            session.currentNode = nextNodeId;
            return flow.nodes[nextNodeId].message;

            case "api_call":
            session.currentNode = currentNode.next?.on_success || session.currentNode;
            return currentNode.message;

            case "dynamic_options":
            const optionList = session.data[currentNode.options_source] || [];
            return currentNode.message.replace("{session.data.vendors}", optionList.join("\n"));

            case "switch_flow":
            session.currentNode = currentNode.targetFlow;
            return currentNode.message;

            default:
            return "Sorry, I didnt understad that step.";
        }
    }
}

module.exports = new FlowEngine();