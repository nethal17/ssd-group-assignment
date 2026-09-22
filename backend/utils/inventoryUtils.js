import Inventory from '../models/Inventory.js';
import Notification from '../models/Notifications.js';
import { User } from '../models/user.js';
import { sendNotificationEmail } from './emailService.js';

export const checkLowQuantity = async () => {
  try {
    const lowQuantityThreshold = 10; // Set your threshold
    const lowQuantityItems = await Inventory.find({ quantity: { $lt: lowQuantityThreshold } });

    for (const item of lowQuantityItems) {
      // Notify farmer
      const farmerNotification = new Notification({
        userId: item.farmerId,
        message: `Your product ${item.productName} is running low. Current quantity: ${item.quantity}`,
      });
      await farmerNotification.save();

      const farmer = await User.findById(item.farmerId);
      await sendNotificationEmail(farmer.email, `Your product ${item.productName} is running low.`);

      // Notify managers (all users with admin role)
      const managers = await User.find({ role: 'admin' });
      for (const manager of managers) {
        const managerNotification = new Notification({
          userId: manager._id,
          message: `Product ${item.productName} is running low. Current quantity: ${item.quantity}`,
        });
        await managerNotification.save();
      }
    }
  } catch (error) {
    console.error('Error checking low quantity:', error);
  }
};