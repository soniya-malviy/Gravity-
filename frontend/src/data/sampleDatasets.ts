export const sampleEcommerceData = [
  { order_id: "ORD-1001", customer_name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", address: "123 Maple St", city: "New York", country: "USA", product_name: "Wireless Mouse", category: "Electronics", quantity: 2, unit_price: 25.00, discount: 5.00, total_amount: 45.00, payment_method: "Credit Card", order_date: "2024-01-10", delivery_date: "2024-01-15", delivery_status: "Delivered", notes: "Leave at front door", rating: 5 },
  { order_id: "ORD-1002", customer_name: "Bob Smith", email: "bob@example.com", phone: null, address: "456 Oak Ave", city: "Los Angeles", country: "USA", product_name: "Gaming Keyboard", category: "Electronics", quantity: 1, unit_price: 80.00, discount: null, total_amount: 80.00, payment_method: "PayPal", order_date: "2024-01-12", delivery_date: null, delivery_status: "Pending", notes: null, rating: null },
  { order_id: "ORD-1003", customer_name: "Charlie Brown", email: "charlie@example.com", phone: "555-0103", address: "789 Pine Rd", city: "Chicago", country: "USA", product_name: "USB-C Cable", category: "Accessories", quantity: 3, unit_price: 15.00, discount: 2.00, total_amount: 43.00, payment_method: "Credit Card", order_date: "2024-01-14", delivery_date: "2024-01-18", delivery_status: "Delivered", notes: null, rating: 4 },
  { order_id: "ORD-1004", customer_name: "David Wilson", email: "david@example.com", phone: null, address: "101 Elm St", city: "Houston", country: "USA", product_name: "Monitor Stand", category: "Furniture", quantity: 1, unit_price: 45.00, discount: null, total_amount: 45.00, payment_method: "Debit Card", order_date: "2024-01-15", delivery_date: "2024-01-20", delivery_status: "Delivered", notes: "Handle with care", rating: null },
  { order_id: "ORD-1005", customer_name: "Eva Green", email: "eva@example.com", phone: "555-0105", address: "202 Cedar Ln", city: "Phoenix", country: "USA", product_name: "LED Desk Lamp", category: "Furniture", quantity: 1, unit_price: 35.00, discount: 5.00, total_amount: 30.00, payment_method: "Credit Card", order_date: "2024-01-18", delivery_date: null, delivery_status: "Shipped", notes: null, rating: 5 },
  // ... (truncating for brevity, will provide more in the actual file)
];

// Re-generating full sample data for the file
const generateEcommerce = (count: number) => {
  const categories = ["Electronics", "Accessories", "Furniture", "Office", "Home"];
  const statuses = ["Delivered", "Pending", "Shipped", "Cancelled"];
  return Array.from({ length: count }, (_, i) => ({
    order_id: `ORD-${1000 + i}`,
    customer_name: `Customer ${i}`,
    email: `user${i}@example.com`,
    phone: i % 3 === 0 ? `555-${1000 + i}` : null,
    address: `${i * 10} Main St`,
    city: "City " + (i % 5),
    country: "USA",
    product_name: "Product " + i,
    category: categories[i % categories.length],
    quantity: Math.floor(Math.random() * 5) + 1,
    unit_price: Math.floor(Math.random() * 100) + 10,
    discount: i % 2 === 0 ? Math.floor(Math.random() * 10) : null,
    total_amount: 0, // Calculated later
    payment_method: i % 2 === 0 ? "Credit Card" : "PayPal",
    order_date: `2024-01-${(i % 28) + 1}`,
    delivery_date: i % 5 !== 0 ? `2024-01-${(i % 28) + 3}` : null,
    delivery_status: statuses[i % statuses.length],
    notes: i % 4 === 0 ? "Some notes about order " + i : null,
    rating: i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : null
  }));
};

const generateHR = (count: number) => {
  const depts = ["Engineering", "HR", "Marketing", "Sales", "Finance"];
  return Array.from({ length: count }, (_, i) => ({
    employee_id: `EMP-${1000 + i}`,
    first_name: "First" + i,
    last_name: "Last" + i,
    email: `emp${i}@company.com`,
    department: depts[i % depts.length],
    job_title: "Role " + i,
    hire_date: `2020-${(i % 12) + 1}-01`,
    salary: 50000 + (i * 1000),
    manager_id: i > 0 ? `EMP-${1000 + Math.floor(i/5)}` : null,
    office_location: "Office " + (i % 3),
    phone: i % 2 === 0 ? `555-200${i}` : null,
    emergency_contact: i % 3 === 0 ? "Contact " + i : null,
    performance_score: i % 4 === 0 ? Math.floor(Math.random() * 5) + 1 : null,
    last_review_date: i % 2 === 0 ? `2023-${(i % 12) + 1}-15` : null,
    termination_date: i % 10 === 0 ? `2024-01-01` : null,
    linkedin_url: i % 2 === 0 ? `linkedin.com/in/user${i}` : null,
    education_level: i % 3 === 0 ? "Masters" : "Bachelors",
    years_experience: Math.floor(i / 2)
  }));
};

const generateResearch = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    experiment_id: `EXP-${1000 + i}`,
    researcher: "Researcher " + (i % 5),
    institution: "University " + (i % 3),
    date: `2024-03-${(i % 28) + 1}`,
    sample_id: `SAMP-${5000 + i}`,
    measurement_a: Math.random() * 100,
    measurement_b: i % 4 !== 0 ? Math.random() * 50 : null,
    measurement_c: i % 3 === 0 ? Math.random() * 10 : null,
    control_value: 0.5,
    temperature: 20 + Math.random() * 10,
    humidity: 40 + Math.random() * 20,
    pressure: 1013 + Math.random() * 5,
    equipment_id: `EQ-${i % 4}`,
    calibration_date: `2024-01-01`,
    notes: i % 2 === 0 ? "Observation " + i : null,
    peer_reviewed: i % 3 === 0,
    publication_doi: i % 5 === 0 ? `10.1000/${i}` : null,
    replication_count: i % 2 === 0 ? Math.floor(Math.random() * 10) : null
  }));
};

const generateMedical = (count: number) => {
  const bloodTypes = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  return Array.from({ length: count }, (_, i) => ({
    patient_id: `PAT-${1000 + i}`,
    age: 20 + (i % 60),
    gender: i % 2 === 0 ? "Male" : "Female",
    blood_type: bloodTypes[i % bloodTypes.length],
    diagnosis_primary: "Diagnosis A" + (i % 5),
    diagnosis_secondary: i % 2 === 0 ? "Diagnosis B" + (i % 3) : null,
    admission_date: `2024-02-${(i % 28) + 1}`,
    discharge_date: i % 6 !== 0 ? `2024-02-${(i % 28) + 5}` : null,
    doctor_id: `DOC-${i % 10}`,
    ward: "Ward " + (i % 5),
    procedure_code: `PROC-${100 + i}`,
    medication_1: "Med A",
    medication_2: i % 3 === 0 ? "Med B" : null,
    medication_3: i % 5 === 0 ? "Med C" : null,
    allergy: i % 4 === 0 ? "Allergy " + i : null,
    insurance_provider: "Provider " + (i % 3),
    insurance_id: `INS-${2000 + i}`,
    emergency_contact: i % 2 === 0 ? "Contact " + i : null,
    follow_up_date: i % 3 === 0 ? `2024-03-01` : null
  }));
};

export const sampleDatasets = {
  ecommerce: generateEcommerce(100),
  hr: generateHR(80),
  research: generateResearch(120),
  medical: generateMedical(60)
};
