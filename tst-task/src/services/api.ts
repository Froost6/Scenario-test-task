import { Scenario, ScenarioListItem } from "../types";

const MOCK_SCENARIOS: ScenarioListItem[] = [
    {id: '1', name: 'Приветственный сценарий', updatedAt:new Date('2025-04-01').toISOString()},
    {id: '2', name: 'Сценарий обработки заказа', updatedAt:new Date('2025-04-02').toISOString()},
    {id: '3', name: 'Сценарий возврата', updatedAt:new Date('2025-04-03').toISOString()}
]

const MOCK_SCENARIO_DATA: Record<string, Scenario> = {
    '1': {
        id: '1',
        name: 'Приветственный сценарий',
        updatedAt: new Date('2025-04-01').toISOString(),
        nodes: [
            { id:'node-1', type: 'action', position: { x:250, y:50 }, data: { label: 'Старт' } },
            { id:'node-2', type: 'action', position: { x:250, y:200 }, data: { label: 'Отправить приветствие' } },
            { id:'node-3', type: 'condition', position: { x:250, y:350 }, data: { label: 'Есть ли ответ?', description: 'Проверка ответа пользователя' } },
        ],
        edges: [
            { id: 'edge-1', source: 'node-1', target: 'node-2'},
            { id: 'edge-2', source: 'node-2', target: 'node-3' }
        ],
    },
    '2': {
        id: '2',
        name: 'Сценарий обработки заказа',
        updatedAt: new Date('2025-04-02').toISOString(),
        nodes:[],
        edges:[],
    },
    '3': {
        id: '3',
        name: 'Сценарий возврата',
        updatedAt: new Date('2025-04-03').toISOString(),
        nodes:[],
        edges:[],
    }
}

const delay = (ms: number) => new Promise( resolve => setTimeout(resolve, ms));

export const api = {
    async getScenarios():Promise<ScenarioListItem[]> {
        await delay(400)
        return [...MOCK_SCENARIOS]
    },

    async getScenario(id: string):Promise<Scenario | null> {
        await delay(300)
        const scenario = MOCK_SCENARIO_DATA[id]
        return scenario ? JSON.parse(JSON.stringify(scenario)) : null
    },

    async createScenario(name: string): Promise<Scenario> {
        await delay(500)
        const newId = Date.now().toString()
        const newScenario: Scenario = {
            id: newId,
            name,
            updatedAt: new Date().toISOString(),
            nodes:[],
            edges:[],
        }
        MOCK_SCENARIO_DATA[newId] = newScenario
        MOCK_SCENARIOS.unshift({ id: newId, name, updatedAt: newScenario.updatedAt })
        return JSON.parse(JSON.stringify(newScenario))
    },

    async saveScenario(scenario: Scenario): Promise<void> {
        await delay(400)
        if (MOCK_SCENARIO_DATA[scenario.id]) {
            MOCK_SCENARIO_DATA[scenario.id] = JSON.parse(JSON.stringify({
                ...scenario,
                updatedAt: new Date().toISOString()
            }))

            const listItem = MOCK_SCENARIOS.find( s => s.id === scenario.id)
            if (listItem) {
                listItem.updatedAt = new Date().toISOString()
                listItem.name = scenario.name
            }
        }
    }
}