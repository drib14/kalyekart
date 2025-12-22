import Settings from "../models/settings.model.js";

export const getSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			settings = await Settings.create({});
		}
		res.json(settings);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateSettings = async (req, res) => {
	try {
		const { general, delivery, loyalty, notifications } = req.body;
		let settings = await Settings.findOne();
		if (!settings) {
			settings = new Settings({});
		}

		if (general) settings.general = { ...settings.general, ...general };
		if (delivery) settings.delivery = { ...settings.delivery, ...delivery };
		if (loyalty) settings.loyalty = { ...settings.loyalty, ...loyalty };
		if (notifications) settings.notifications = { ...settings.notifications, ...notifications };

		await settings.save();
		res.json(settings);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
