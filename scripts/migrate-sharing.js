// scripts/migrate-sharing.js
const { connectToDatabase } = require('../src/lib/db');
const { Quotation } = require('../src/models/Quotation');

async function runMigration() {
  try {
    console.log('Starting sharing field migration...');
    
    await connectToDatabase();
    
    // Update all quotations that don't have the sharing field
    const result = await Quotation.updateMany(
      { sharing: { $exists: false } },
      {
        $set: {
          sharing: {
            isShared: false,
            shareToken: null,
            sharedAt: null,
            sharedBy: null,
            accessCount: 0,
            lastAccessedAt: null,
          }
        }
      }
    );
    
    console.log(`Migration completed: Updated ${result.modifiedCount} quotations with sharing field`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();