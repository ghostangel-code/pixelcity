import { Injectable } from '@nestjs/common';
import { AreaVisitEntity, VisibleUser } from './area-visit.entity';
import { PublicAreaEntity } from './public-area.entity';

interface InteractionWeight {
  chat: number;
  trade: number;
  gift: number;
  event: number;
  visit: number;
}

const DEFAULT_WEIGHTS: InteractionWeight = {
  chat: 1,
  trade: 2,
  gift: 3,
  event: 5,
  visit: 0.5,
};

const RECENCY_DECAY = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class VisibilityService {
  private interactionWeights: InteractionWeight = DEFAULT_WEIGHTS;

  setInteractionWeights(weights: Partial<InteractionWeight>): void {
    this.interactionWeights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  calculateInteractionScore(
    interactions: Array<{ type: string; timestamp: Date }>,
  ): number {
    let totalScore = 0;
    const now = Date.now();

    for (const interaction of interactions) {
      const age = now - new Date(interaction.timestamp).getTime();
      const decayFactor = Math.max(0, 1 - age / RECENCY_DECAY);
      const typeWeight = this.interactionWeights[interaction.type as keyof InteractionWeight] || 1;
      totalScore += typeWeight * decayFactor;
    }

    return totalScore;
  }

  selectVisibleAgents(
    allAgentsInArea: AreaVisitEntity[],
    currentAgentId: string,
    maxVisible: number,
    interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>>,
  ): string[] {
    const otherAgents = allAgentsInArea.filter(
      (visit) => visit.agentId !== currentAgentId && !visit.exitedAt,
    );

    if (otherAgents.length <= maxVisible) {
      return otherAgents.map((visit) => visit.agentId);
    }

    const scoredAgents = otherAgents.map((visit) => {
      const interactions = interactionHistory.get(visit.agentId) || [];
      const score = this.calculateInteractionScore(interactions);
      const timeBonus = this.calculateTimeBonus(visit.enteredAt);

      return {
        agentId: visit.agentId,
        score: score + timeBonus,
      };
    });

    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents.slice(0, maxVisible).map((agent) => agent.agentId);
  }

  private calculateTimeBonus(enteredAt: Date): number {
    const now = Date.now();
    const timeInArea = now - new Date(enteredAt).getTime();
    const hourInMs = 60 * 60 * 1000;

    if (timeInArea < hourInMs) {
      return (1 - timeInArea / hourInMs) * 0.5;
    }
    return 0;
  }

  updateVisibleUsers(
    currentVisit: AreaVisitEntity,
    allVisits: AreaVisitEntity[],
    interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>>,
  ): VisibleUser[] {
    const maxVisible = 20;
    const visibleAgentIds = this.selectVisibleAgents(
      allVisits,
      currentVisit.agentId,
      maxVisible,
      interactionHistory,
    );

    return visibleAgentIds.map((agentId) => {
      const existingVisible = currentVisit.visibleUsers?.find((u) => u.oderId === agentId);
      const interactions = interactionHistory.get(agentId) || [];
      const score = this.calculateInteractionScore(interactions);

      return existingVisible || {
        oderId: agentId,
        addedAt: new Date(),
        interactionScore: score,
      };
    });
  }

  isAgentVisibleTo(
    targetAgentId: string,
    observerVisit: AreaVisitEntity,
  ): boolean {
    const visibleIds = observerVisit.visibleUsers?.map((u) => u.oderId) || [];
    return visibleIds.includes(targetAgentId);
  }

  onAgentEnter(
    newVisit: AreaVisitEntity,
    allVisits: AreaVisitEntity[],
    interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>>,
  ): void {
    const area = newVisit.area as PublicAreaEntity;
    const maxVisible = area?.maxVisibleAgents || 20;

    newVisit.visibleUsers = this.selectVisibleAgents(
      allVisits,
      newVisit.agentId,
      maxVisible,
      interactionHistory,
    ).map((agentId) => ({
      oderId: agentId,
      addedAt: new Date(),
      interactionScore: 0,
    }));

    for (const visit of allVisits) {
      if (visit.id === newVisit.id || visit.exitedAt) continue;

      const visibleUsers = visit.visibleUsers || [];
      const allAgentIdsInArea = allVisits
        .filter((v) => !v.exitedAt && v.id !== visit.id)
        .map((v) => v.agentId);

      const newVisibleIds = this.selectVisibleAgents(
        allVisits.filter((v) => !v.exitedAt),
        visit.agentId,
        maxVisible,
        interactionHistory,
      );

      visit.visibleUsers = newVisibleIds.map((agentId) => {
        const existing = visibleUsers.find((u) => u.oderId === agentId);
        if (existing) return existing;

        const interactions = interactionHistory.get(agentId) || [];
        return {
          oderId: agentId,
          addedAt: new Date(),
          interactionScore: this.calculateInteractionScore(interactions),
        };
      });
    }
  }

  onAgentLeave(
    leavingVisit: AreaVisitEntity,
    allVisits: AreaVisitEntity[],
    interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>>,
  ): void {
    const area = leavingVisit.area as PublicAreaEntity;
    const maxVisible = area?.maxVisibleAgents || 20;

    for (const visit of allVisits) {
      if (visit.exitedAt) continue;

      const visibleUsers = visit.visibleUsers || [];
      const newVisibleIds = this.selectVisibleAgents(
        allVisits.filter((v) => !v.exitedAt && v.id !== visit.id),
        visit.agentId,
        maxVisible,
        interactionHistory,
      );

      visit.visibleUsers = newVisibleIds.map((agentId) => {
        const existing = visibleUsers.find((u) => u.oderId === agentId);
        if (existing) return existing;

        const interactions = interactionHistory.get(agentId) || [];
        return {
          oderId: agentId,
          addedAt: new Date(),
          interactionScore: this.calculateInteractionScore(interactions),
        };
      });
    }
  }

  recordInteraction(
    agentId1: string,
    agentId2: string,
    interactionType: string,
    interactionHistory: Map<string, Array<{ type: string; timestamp: Date }>>,
  ): void {
    const interaction = { type: interactionType, timestamp: new Date() };

    const history1 = interactionHistory.get(agentId1) || [];
    history1.push(interaction);
    interactionHistory.set(agentId1, history1.slice(-100));

    const history2 = interactionHistory.get(agentId2) || [];
    history2.push(interaction);
    interactionHistory.set(agentId2, history2.slice(-100));
  }
}
