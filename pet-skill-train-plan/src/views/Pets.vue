<template>
  <div class="pets-page">
    <div class="page-header">
      <h2 class="page-title">宠物管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加宠物
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="pet in petStore.pets" :key="pet.id">
        <el-card class="pet-card" :class="{ active: pet.id === petStore.currentPetId }">
          <div class="pet-card-header">
            <div class="pet-avatar-large">{{ pet.avatar }}</div>
            <div class="pet-basic-info">
              <h3 class="pet-name">{{ pet.name }}</h3>
              <el-tag :type="pet.type === 'dog' ? 'primary' : 'success'" size="small">
                {{ pet.type === 'dog' ? '狗狗' : '猫咪' }}
              </el-tag>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => handleAction(cmd, pet)">
              <el-button type="text" :icon="MoreFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="select">设为当前</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <el-descriptions :column="2" size="small" class="pet-descriptions">
            <el-descriptions-item label="品种">
              {{ getBreedLabel(pet) }}
            </el-descriptions-item>
            <el-descriptions-item label="年龄">
              {{ pet.age }}{{ pet.ageUnit === 'years' ? '岁' : '个月' }}
            </el-descriptions-item>
            <el-descriptions-item label="体重">
              {{ pet.weight }}kg
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ pet.gender === 'male' ? '公' : '母' }}
            </el-descriptions-item>
            <el-descriptions-item label="年龄段" :span="2">
              {{ getAgeGroupLabel(pet) }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="pet-tags" v-if="pet.personality">
            <el-tag type="info" size="small">{{ pet.personality }}</el-tag>
          </div>

          <el-divider />

          <div class="pet-training-info">
            <div class="info-item">
              <span class="info-label">训练计划</span>
              <span class="info-value">{{ getPlanCount(pet.id) }} 个</span>
            </div>
            <div class="info-item">
              <span class="info-label">累计训练</span>
              <span class="info-value">{{ getTrainingDays(pet.id) }} 天</span>
            </div>
          </div>

          <el-progress
            :percentage="getTrainingProgress(pet.id)"
            :stroke-width="6"
            style="margin-top: 12px"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑宠物' : '添加宠物'" width="600px">
      <el-form :model="petForm" :rules="formRules" ref="petFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="name">
              <el-input v-model="petForm.name" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宠物类型" prop="type">
              <el-select v-model="petForm.type" placeholder="选择类型" style="width: 100%" @change="handleTypeChange">
                <el-option
                  v-for="type in petStore.petTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品种" prop="breed">
              <el-select v-model="petForm.breed" placeholder="选择品种" style="width: 100%">
                <el-option
                  v-for="breed in availableBreeds"
                  :key="breed.value"
                  :label="breed.label"
                  :value="breed.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="petForm.gender">
                <el-radio value="male">公</el-radio>
                <el-radio value="female">母</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="petForm.age" :min="0" :max="30" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年龄单位" prop="ageUnit">
              <el-select v-model="petForm.ageUnit" style="width: 100%">
                <el-option label="个月" value="months" />
                <el-option label="岁" value="years" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="体重(kg)" prop="weight">
              <el-input-number v-model="petForm.weight" :min="0" :max="100" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="性格特点">
          <el-input v-model="petForm.personality" placeholder="描述宠物的性格特点" />
        </el-form-item>

        <el-form-item label="头像">
          <el-radio-group v-model="petForm.avatar">
            <el-radio value="🐕" v-if="petForm.type === 'dog'">🐕</el-radio>
            <el-radio value="🐶" v-if="petForm.type === 'dog'">🐶</el-radio>
            <el-radio value="🐩" v-if="petForm.type === 'dog'">🐩</el-radio>
            <el-radio value="🦮" v-if="petForm.type === 'dog'">🦮</el-radio>
            <el-radio value="🐱" v-if="petForm.type === 'cat'">🐱</el-radio>
            <el-radio value="😺" v-if="petForm.type === 'cat'">😺</el-radio>
            <el-radio value="😸" v-if="petForm.type === 'cat'">😸</el-radio>
            <el-radio value="🐈" v-if="petForm.type === 'cat'">🐈</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPet">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePetStore } from '../stores/pet';
import { useTrainingStore } from '../stores/training';
import { MoreFilled } from '@element-plus/icons-vue';

const petStore = usePetStore();
const trainingStore = useTrainingStore();

const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const petFormRef = ref(null);

const petForm = reactive({
  name: '',
  type: 'dog',
  breed: '',
  gender: 'male',
  age: 1,
  ageUnit: 'years',
  weight: 5,
  personality: '',
  avatar: '🐕',
  healthStatus: 'healthy'
});

const formRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择宠物类型', trigger: 'change' }],
  breed: [{ required: true, message: '请选择品种', trigger: 'change' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入体重', trigger: 'blur' }]
};

const availableBreeds = computed(() => {
  return petStore.breeds[petForm.type] || [];
});

const getBreedLabel = (pet) => {
  const breedInfo = petStore.getBreedInfo(pet);
  return breedInfo.label || '未知品种';
};

const getAgeGroupLabel = (pet) => {
  const ageGroup = petStore.getAgeGroup(pet);
  return ageGroup.label;
};

const getPlanCount = (petId) => {
  return trainingStore.getPetPlans(petId).length;
};

const getTrainingDays = (petId) => {
  const records = trainingStore.getPetRecords(petId);
  const dates = new Set(records.map(r => r.date));
  return dates.size;
};

const getTrainingProgress = (petId) => {
  const plans = trainingStore.getPetPlans(petId);
  if (plans.length === 0) return 0;
  const totalProgress = plans.reduce((sum, plan) => sum + trainingStore.calculateProgress(plan), 0);
  return Math.round(totalProgress / plans.length);
};

const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  Object.assign(petForm, {
    name: '',
    type: 'dog',
    breed: '',
    gender: 'male',
    age: 1,
    ageUnit: 'years',
    weight: 5,
    personality: '',
    avatar: '🐕',
    healthStatus: 'healthy'
  });
  dialogVisible.value = true;
};

const handleTypeChange = () => {
  petForm.breed = '';
  petForm.avatar = petForm.type === 'dog' ? '🐕' : '🐱';
};

const handleAction = (command, pet) => {
  switch (command) {
    case 'select':
      petStore.setCurrentPet(pet.id);
      ElMessage.success(`已将 ${pet.name} 设为当前宠物`);
      break;
    case 'edit':
      isEdit.value = true;
      editId.value = pet.id;
      Object.assign(petForm, pet);
      dialogVisible.value = true;
      break;
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除 ${pet.name} 吗？相关的训练计划也会受到影响。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        petStore.deletePet(pet.id);
        ElMessage.success('删除成功');
      }).catch(() => {});
      break;
  }
};

const submitPet = () => {
  petFormRef.value?.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        petStore.updatePet(editId.value, { ...petForm });
        ElMessage.success('修改成功');
      } else {
        petStore.addPet({ ...petForm });
        ElMessage.success('添加成功');
      }
      dialogVisible.value = false;
    }
  });
};
</script>

<style scoped>
.pets-page {
  padding: 0;
}

.pet-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.pet-card.active {
  border: 2px solid #1890ff;
}

.pet-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pet-avatar-large {
  font-size: 56px;
  line-height: 1;
}

.pet-basic-info {
  flex: 1;
}

.pet-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pet-descriptions {
  margin-bottom: 12px;
}

.pet-tags {
  margin-bottom: 8px;
}

.pet-training-info {
  display: flex;
  justify-content: space-around;
}

.info-item {
  text-align: center;
}

.info-label {
  display: block;
  color: #999;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}
</style>
