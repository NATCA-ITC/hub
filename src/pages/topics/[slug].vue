<template>
  <div class="d-flex flex-column ga-5">
    <NatcaPageHeader
      :title="topic?.name ?? 'Topic'"
      :subtitle="topic ? topicTypeLabel[topic.type] : 'Loading...'"
    >
      <template #actions>
        <VBtn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="$router.push('/topics')"
        >
          All Topics
        </VBtn>
      </template>
    </NatcaPageHeader>

    <template v-if="topic">
      <NatcaCard title="About">
        <div class="d-flex align-start ga-3">
          <VIcon
            :icon="topic.icon"
            size="32"
            class="mt-1"
          />
          <div>
            <p class="text-body-2">
              {{ topic.description }}
            </p>
          </div>
        </div>
      </NatcaCard>

      <NatcaCard
        v-if="topic.leads?.length"
        title="Leads"
      >
        <VList
          density="compact"
          lines="one"
        >
          <VListItem
            v-for="lead in topic.leads"
            :key="lead.role + lead.name"
            :title="lead.name"
            :subtitle="lead.role"
            prepend-icon="mdi-account-tie"
          />
        </VList>
      </NatcaCard>

      <NatcaCard
        v-if="topic.committees?.length"
        :title="`Committees & Groups (${topic.committees.length})`"
      >
        <VList
          density="compact"
          lines="two"
        >
          <VListItem
            v-for="c in topic.committees"
            :key="c.name"
            :title="c.abbr ? `${c.name} (${c.abbr})` : c.name"
            :subtitle="c.lead ?? ''"
            prepend-icon="mdi-account-group-outline"
          />
        </VList>
      </NatcaCard>

      <NatcaCard title="Updates">
        <NatcaEmptyState
          icon="mdi-newspaper"
          title="Updates feed coming soon"
          description="Posts and announcements scoped to this topic will appear here once the Updates system is live."
        />
      </NatcaCard>

      <NatcaCard title="Documents">
        <NatcaEmptyState
          icon="mdi-file-document-multiple"
          title="Documents coming soon"
          description="Charters, meeting minutes, and reference docs will be embedded from DMS."
        />
      </NatcaCard>

      <NatcaCard title="Discord">
        <NatcaEmptyState
          icon="mdi-message-text"
          title="Discord channel pending"
          description="Each topic mirrors a private channel under the TOPICS category in the NATCA Discord server. Permissions wiring is TBD."
        />
      </NatcaCard>
    </template>

    <NatcaEmptyState
      v-else
      icon="mdi-alert-circle-outline"
      title="Topic not found"
      description="The requested topic does not exist."
      action-label="Back to Topics"
      @action="$router.push('/topics')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NatcaPageHeader, NatcaCard, NatcaEmptyState } from '@natca-itc/ui-shell'
import { topicsBySlug, topicTypeLabel } from '@/data/topics'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const topic = computed(() => topicsBySlug[slug.value] ?? null)
</script>
