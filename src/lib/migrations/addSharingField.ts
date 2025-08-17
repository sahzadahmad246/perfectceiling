// lib/migrations/addSharingField.ts
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";

/**
 * Migration to add sharing field to existing quotations
 */
export async function addSharingFieldMigration(): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addSharingFieldMigration()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}