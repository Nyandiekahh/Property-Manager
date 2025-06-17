// backend/services/enhancedPropertyService.js - Advanced Property & Unit Management

import { db } from '../config/firebaseClient.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where 
} from 'firebase/firestore';

export class EnhancedPropertyService {
  
  // Create property with unit types and paybill configuration
  async createProperty(propertyData, landlordId) {
    const {
      name,
      location,
      type,
      paybill,
      accountPrefix,
      unitTypes, // Array of unit type configurations
      description,
      image
    } = propertyData;

    // Validate required fields
    if (!paybill || !accountPrefix || !unitTypes || unitTypes.length === 0) {
      throw new Error('Paybill, account prefix, and unit types are required');
    }

    // Generate all units based on unit types
    const allUnits = this.generateUnitsFromTypes(unitTypes, paybill, accountPrefix);
    
    const totalUnits = allUnits.length;
    
    const docRef = await addDoc(collection(db, 'properties'), {
      name,
      location,
      type,
      paybill,
      accountPrefix,
      unitTypes,
      description,
      image,
      landlordId,
      totalUnits,
      occupiedUnits: 0,
      availableUnits: totalUnits,
      units: allUnits,
      monthlyRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  }

  // Generate units from unit type configurations
  generateUnitsFromTypes(unitTypes, paybill, accountPrefix) {
    const units = [];
    
    unitTypes.forEach(unitType => {
      const { 
        type, // 'bedsitter', '1bedroom', '2bedroom', '3bedroom'
        startUnit, 
        endUnit, 
        rentAmount,
        description 
      } = unitType;
      
      // Parse unit ranges (e.g., "A1" to "A10", "B1" to "B5")
      const startNum = this.extractUnitNumber(startUnit);
      const endNum = this.extractUnitNumber(endUnit);
      const prefix = this.extractUnitPrefix(startUnit);
      
      for (let i = startNum; i <= endNum; i++) {
        const unitNumber = `${prefix}${i}`;
        const accountNumber = `${accountPrefix}#${unitNumber}`;
        
        units.push({
          unitNumber,
          unitType: type,
          rentAmount: parseFloat(rentAmount),
          accountNumber,
          isOccupied: false,
          tenantId: null,
          description: description || `${type} unit`,
          createdAt: new Date()
        });
      }
    });
    
    return units;
  }

  // Extract numeric part from unit number (e.g., "A10" -> 10)
  extractUnitNumber(unitStr) {
    const match = unitStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  // Extract prefix from unit number (e.g., "A10" -> "A")
  extractUnitPrefix(unitStr) {
    const match = unitStr.match(/([A-Za-z]*)/);
    return match ? match[1] : '';
  }

  // Get available units by type
  async getAvailableUnitsByType(propertyId, unitType = null) {
    const property = await this.getProperty(propertyId);
    if (!property || !property.units) return [];
    
    let availableUnits = property.units.filter(unit => !unit.isOccupied);
    
    if (unitType) {
      availableUnits = availableUnits.filter(unit => unit.unitType === unitType);
    }
    
    return availableUnits;
  }

  // Get unit types available in a property
  async getUnitTypes(propertyId) {
    const property = await this.getProperty(propertyId);
    if (!property || !property.unitTypes) return [];
    
    return property.unitTypes.map(unitType => ({
      type: unitType.type,
      rentAmount: unitType.rentAmount,
      availableCount: property.units.filter(unit => 
        unit.unitType === unitType.type && !unit.isOccupied
      ).length,
      totalCount: property.units.filter(unit => 
        unit.unitType === unitType.type
      ).length
    }));
  }

  // Assign tenant to specific unit
  async assignTenantToUnit(propertyId, unitNumber, tenantId) {
    const property = await this.getProperty(propertyId);
    if (!property) throw new Error('Property not found');
    
    const targetUnit = property.units.find(unit => unit.unitNumber === unitNumber);
    if (!targetUnit) throw new Error('Unit not found');
    
    if (targetUnit.isOccupied) {
      throw new Error(`Unit ${unitNumber} is already occupied`);
    }
    
    // Update the specific unit
    const updatedUnits = property.units.map(unit => {
      if (unit.unitNumber === unitNumber) {
        return {
          ...unit,
          isOccupied: true,
          tenantId,
          occupiedAt: new Date()
        };
      }
      return unit;
    });
    
    const occupiedCount = updatedUnits.filter(unit => unit.isOccupied).length;
    
    // Update property
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      units: updatedUnits,
      occupiedUnits: occupiedCount,
      availableUnits: property.totalUnits - occupiedCount,
      monthlyRevenue: this.calculateMonthlyRevenue(updatedUnits),
      updatedAt: new Date()
    });
    
    return targetUnit;
  }

  // Remove tenant from unit (move out)
  async removeTenantFromUnit(propertyId, unitNumber) {
    const property = await this.getProperty(propertyId);
    if (!property) throw new Error('Property not found');
    
    const updatedUnits = property.units.map(unit => {
      if (unit.unitNumber === unitNumber) {
        return {
          ...unit,
          isOccupied: false,
          tenantId: null,
          vacatedAt: new Date()
        };
      }
      return unit;
    });
    
    const occupiedCount = updatedUnits.filter(unit => unit.isOccupied).length;
    
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      units: updatedUnits,
      occupiedUnits: occupiedCount,
      availableUnits: property.totalUnits - occupiedCount,
      monthlyRevenue: this.calculateMonthlyRevenue(updatedUnits),
      updatedAt: new Date()
    });
  }

  // Calculate total monthly revenue from occupied units
  calculateMonthlyRevenue(units) {
    return units
      .filter(unit => unit.isOccupied)
      .reduce((total, unit) => total + unit.rentAmount, 0);
  }

  // Get property details
  async getProperty(propertyId) {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    if (propertySnap.exists()) {
      return { id: propertySnap.id, ...propertySnap.data() };
    }
    return null;
  }

  // Get all properties for landlord
  async getProperties(landlordId) {
    const q = query(
      collection(db, 'properties'),
      where('landlordId', '==', landlordId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Update property (including unit types)
  async updateProperty(propertyId, updateData) {
    const propertyRef = doc(db, 'properties', propertyId);
    
    // If unit types are being updated, regenerate units
    if (updateData.unitTypes) {
      const property = await this.getProperty(propertyId);
      const existingOccupiedUnits = property.units.filter(unit => unit.isOccupied);
      
      // Generate new units
      const newUnits = this.generateUnitsFromTypes(
        updateData.unitTypes, 
        updateData.paybill || property.paybill,
        updateData.accountPrefix || property.accountPrefix
      );
      
      // Preserve existing occupied units if they still exist in new structure
      const finalUnits = newUnits.map(newUnit => {
        const existingUnit = existingOccupiedUnits.find(
          occupied => occupied.unitNumber === newUnit.unitNumber
        );
        return existingUnit || newUnit;
      });
      
      updateData.units = finalUnits;
      updateData.totalUnits = finalUnits.length;
      updateData.occupiedUnits = finalUnits.filter(unit => unit.isOccupied).length;
      updateData.availableUnits = updateData.totalUnits - updateData.occupiedUnits;
    }
    
    await updateDoc(propertyRef, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  // Delete property
  async deleteProperty(propertyId) {
    // Check if property has occupied units
    const property = await this.getProperty(propertyId);
    if (property && property.occupiedUnits > 0) {
      throw new Error('Cannot delete property with occupied units. Please move out all tenants first.');
    }
    
    const propertyRef = doc(db, 'properties', propertyId);
    await deleteDoc(propertyRef);
  }

  // Get unit details by account number
  async getUnitByAccountNumber(accountNumber) {
    const propertiesQuery = query(collection(db, 'properties'));
    const snapshot = await getDocs(propertiesQuery);
    
    for (const doc of snapshot.docs) {
      const property = { id: doc.id, ...doc.data() };
      if (property.units) {
        const unit = property.units.find(u => u.accountNumber === accountNumber);
        if (unit) {
          return {
            ...unit,
            propertyId: property.id,
            propertyName: property.name
          };
        }
      }
    }
    
    return null;
  }
}

export default new EnhancedPropertyService();