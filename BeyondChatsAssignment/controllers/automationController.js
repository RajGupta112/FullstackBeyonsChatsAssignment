import * as automationService from '../services/automationService.js';

export const triggerAutomation = async (req, res) => {
    try {
        const data = await automationService.runAIAutomation();
        res.status(200).json({
            message: "Gemini AI Enhancement Successful",
            count: data.length,
            data
        });
    } catch (error) {
        console.error("Automation Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};