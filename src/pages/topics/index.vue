<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      title="Topics"
      subtitle="Councils, standing committees, and cross-cutting discussion areas — mirrors the Discord TOPICS category"
    />

    <VTextField
      v-model="search"
      label="Search topics..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-2"
      style="max-width: 400px;"
    />

    <template
      v-for="group in visibleGroups"
      :key="group.type"
    >
      <div>
        <div class="text-overline text-medium-emphasis mb-2">
          {{ group.label }} ({{ group.items.length }})
        </div>
        <VRow>
          <VCol
            v-for="topic in group.items"
            :key="topic.slug"
            cols="12"
            sm="6"
            md="4"
          >
            <router-link
              :to="`/topics/${topic.slug}`"
              class="text-decoration-none"
            >
              <NatcaCard :title="topic.name">
                <template #prepend>
                  <VIcon
                    :icon="topic.icon"
                    size="22"
                    class="me-2"
                  />
                </template>
                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ topic.description }}
                </p>
                <div
                  v-if="topic.leads?.length"
                  class="d-flex flex-wrap ga-1 mt-2"
                >
                  <VChip
                    v-for="lead in topic.leads"
                    :key="lead.role + lead.name"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ lead.name }}
                  </VChip>
                </div>
                <div
                  v-if="topic.committees?.length"
                  class="text-caption text-medium-emphasis mt-2"
                >
                  {{ topic.committees.length }} committee{{ topic.committees.length === 1 ? '' : 's' }}
                </div>
              </NatcaCard>
            </router-link>
          </VCol>
        </VRow>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NatcaPageHeader, NatcaCard } from '@natca-itc/ui-shell'
import { topics, type TopicType } from '@/data/topics'

const search = ref('')

const filtered = computed(() => {
  if (!search.value) return topics
  const q = search.value.toLowerCase()
  return topics.filter(t =>
    t.name.toLowerCase().includes(q)
    || t.description.toLowerCase().includes(q)
    || t.committees?.some(c => c.name.toLowerCase().includes(q) || c.abbr?.toLowerCase().includes(q))
    || t.leads?.some(l => l.name.toLowerCase().includes(q)),
  )
})

const groupOrder: TopicType[] = ['council', 'standing-committee', 'cross-cutting']

const visibleGroups = computed(() =>
  groupOrder
    .map(type => ({
      type,
      label: type === 'council'
        ? 'Councils'
        : type === 'standing-committee'
          ? 'Standing Committees'
          : 'Cross-Cutting Topics',
      items: filtered.value.filter(t => t.type === type),
    }))
    .filter(g => g.items.length > 0),
)

</script>
