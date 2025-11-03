import { seedDefaultPlans } from '../modules/plans/plan.service';
import { createUser, getUserByEmail } from '../modules/user/user.service';
import { UserRole } from '../modules/user/user.constants';
import connectToMongoDB from '../utils/mongo-connection';
import config from '../config/default';

// Seed default admin user
const seedAdminUser = async (): Promise<void> => {
    const adminEmail = 'admin@esfitness.com';
    const adminPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await getUserByEmail(adminEmail);
    if (existingAdmin) {
        console.log('✅ Admin user already exists');
        return;
    }

    // Create admin user
    const adminUser = await createUser({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
        isVerified: true,
        isActive: true
    });

    console.log('✅ Admin user created successfully:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
    });
};

const seedData = async () => {
    try {
        // Connect to database
        await connectToMongoDB(config.db.uri);

        // Seed admin user
        await seedAdminUser();
        console.log('✅ Admin user seeded successfully');

        // Only seed plans if Stripe is configured (since plans don't require Stripe but the service might import dependencies that do)
        try {
            await seedDefaultPlans();
            console.log('✅ Plans seeded successfully');
        } catch (error) {
            console.log('⚠️ Could not seed plans (this is okay if Stripe is not configured):', error);
        }

        console.log('🌱 All data seeded successfully');
        throw new Error('Seeding completed successfully'); // Use error to exit instead of process.exit
    } catch (error) {
        if (error instanceof Error && error.message === 'Seeding completed successfully') {
            console.log('✅ Seeding completed successfully');
            return;
        }
        console.error('❌ Error seeding data:', error);
        throw error; // Re-throw the error instead of using process.exit
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedData();
}

export default seedData;
