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
                data: {stylists: flow.stylists}
            };
        }
        return this.sessions[userId];
    }

    async handleMessage(userId, userMessage, flowName) {
        const flow = this.loadFlow(flowName);
        const session = this.getSession(userId, flowName);
        const node = flow.nodes[session.currentNode];

        switch (node.type) {
            case "info":
            session.currentNode = node.next?.target || session.currentNode;
            return this.interpolate(node.message, session);

            case "options":
            const choice = userMessage.trim();
            const nextNodeId = node.option_routes[choice];
            if (!nextNodeId) {
                return `Invalid choice. Please reply with one of: ${Object.keys(node.option_routes).join(", ")}`;
            }
            session.data[node.data_key] = choice;
            session.currentNode = nextNodeId;
            return this.interpolate (flow.nodes[nextNodeId].message, session);

            case "dynamic_options":
            const optionsSource = this.resolvePath(session.data, node.options_source);
            if (!optionsSource || optionsSource.length === 0) {
            session.currentNode = node.next?.on_failure || "error";
            return this.interpolate(flow.node[session.currentNode].message, session);
            }
            session.data[node.data_key] = userMessage.trim();
            session.currentNode = node.next?.on_success;
            return this.interpolate(node.message, session);

            default:
            return "Sorry, I didnt understad that step.";
        }
    }

            interpolate(message, session) {
                return message.replace(/\{([^]+)\}/g, (_, key) => {
                    const value = this.resolvePath(session, key);
                    return value !== undefined ? JSON.stringify(value) : "";
                });
            }

            resolvePath(obj, pathStr) {
                return pathStr.split(".").reduce((acc, part) => acc?.[part], obj);
            }
        
    
}

module.exports = new FlowEngine();