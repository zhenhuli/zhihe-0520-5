import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePetStore = defineStore('pet', () => {
  const petTypes = [
    { value: 'dog', label: '狗狗' },
    { value: 'cat', label: '猫咪' }
  ];

  const breeds = {
    dog: [
      { value: 'golden_retriever', label: '金毛寻回犬', trainability: 'high', size: 'large' },
      { value: 'labrador', label: '拉布拉多', trainability: 'high', size: 'large' },
      { value: 'poodle', label: '贵宾犬', trainability: 'high', size: 'medium' },
      { value: 'german_shepherd', label: '德国牧羊犬', trainability: 'high', size: 'large' },
      { value: 'border_collie', label: '边境牧羊犬', trainability: 'high', size: 'medium' },
      { value: 'corgi', label: '柯基', trainability: 'medium', size: 'small' },
      { value: 'shiba_inu', label: '柴犬', trainability: 'medium', size: 'medium' },
      { value: 'husky', label: '哈士奇', trainability: 'low', size: 'medium' },
      { value: 'bichon', label: '比熊', trainability: 'medium', size: 'small' },
      { value: 'teddy', label: '泰迪', trainability: 'medium', size: 'small' }
    ],
    cat: [
      { value: 'british_shorthair', label: '英国短毛猫', trainability: 'medium', size: 'medium' },
      { value: 'american_shorthair', label: '美国短毛猫', trainability: 'medium', size: 'medium' },
      { value: 'siamese', label: '暹罗猫', trainability: 'high', size: 'medium' },
      { value: 'persian', label: '波斯猫', trainability: 'low', size: 'medium' },
      { value: 'ragdoll', label: '布偶猫', trainability: 'medium', size: 'large' },
      { value: 'maine_coon', label: '缅因猫', trainability: 'medium', size: 'large' },
      { value: 'scottish_fold', label: '苏格兰折耳猫', trainability: 'medium', size: 'small' }
    ]
  };

  const ageGroups = [
    { value: 'puppy', label: '幼年期 (0-6个月)', difficultyMultiplier: 0.7, attentionSpan: 5 },
    { value: 'juvenile', label: '少年期 (6-12个月)', difficultyMultiplier: 0.9, attentionSpan: 10 },
    { value: 'adult', label: '成年期 (1-7岁)', difficultyMultiplier: 1.0, attentionSpan: 15 },
    { value: 'senior', label: '老年期 (7岁以上)', difficultyMultiplier: 0.6, attentionSpan: 8 }
  ];

  const pets = ref([
    {
      id: 1,
      name: '豆豆',
      type: 'dog',
      breed: 'golden_retriever',
      age: 8,
      ageUnit: 'months',
      weight: 25,
      gender: 'male',
      avatar: '🐕',
      createTime: '2024-01-15',
      personality: '活泼好动，食欲旺盛',
      healthStatus: 'healthy'
    },
    {
      id: 2,
      name: '咪咪',
      type: 'cat',
      breed: 'british_shorthair',
      age: 2,
      ageUnit: 'years',
      weight: 4.5,
      gender: 'female',
      avatar: '🐱',
      createTime: '2023-06-20',
      personality: '高冷独立，喜欢安静',
      healthStatus: 'healthy'
    }
  ]);

  const currentPetId = ref(1);

  const currentPet = computed(() => {
    return pets.value.find(p => p.id === currentPetId.value) || null;
  });

  const getAgeGroup = (pet) => {
    const ageInMonths = pet.ageUnit === 'years' ? pet.age * 12 : pet.age;
    if (ageInMonths < 6) return ageGroups[0];
    if (ageInMonths < 12) return ageGroups[1];
    if (ageInMonths < 84) return ageGroups[2];
    return ageGroups[3];
  };

  const getBreedInfo = (pet) => {
    const typeBreeds = breeds[pet.type] || [];
    return typeBreeds.find(b => b.value === pet.breed) || { trainability: 'medium', size: 'medium' };
  };

  const addPet = (pet) => {
    const newId = Math.max(...pets.value.map(p => p.id), 0) + 1;
    pets.value.push({ ...pet, id: newId, createTime: new Date().toISOString().split('T')[0] });
  };

  const updatePet = (id, data) => {
    const index = pets.value.findIndex(p => p.id === id);
    if (index !== -1) {
      pets.value[index] = { ...pets.value[index], ...data };
    }
  };

  const deletePet = (id) => {
    const index = pets.value.findIndex(p => p.id === id);
    if (index !== -1) {
      pets.value.splice(index, 1);
      if (currentPetId.value === id && pets.value.length > 0) {
        currentPetId.value = pets.value[0].id;
      }
    }
  };

  const setCurrentPet = (id) => {
    currentPetId.value = id;
  };

  return {
    petTypes,
    breeds,
    ageGroups,
    pets,
    currentPetId,
    currentPet,
    getAgeGroup,
    getBreedInfo,
    addPet,
    updatePet,
    deletePet,
    setCurrentPet
  };
});
