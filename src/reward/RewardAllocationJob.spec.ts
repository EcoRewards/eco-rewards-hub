import * as chai from "chai";
import { RewardAllocationJob } from "./RewardAllocationJob";
import { CarbonSavingPolicy } from "./CarbonSavingPolicy";
import { RewardPointPolicy } from "./RewardPointPolicy";

class MockRepository {
  public updates: any = [];
  public journeyIndex = {};
  public rewards = { existingRewards: 0, devices: [] };

  async selectUnprocessedJourneysIndexedByMemberAndDate() {
    return this.journeyIndex;
  }

  async selectMemberRewardsGeneratedOn() {
    return this.rewards;
  }

  async updateRewards(...args: any[]) {
    this.updates.push(args);
  }
}

describe("RewardAllocationJob", () => {
  const carbonSavingPolicy = new CarbonSavingPolicy();
  const rewardPointPolicy = new RewardPointPolicy();
  const mockRepository = new MockRepository() as any;
  const job = new RewardAllocationJob(
    mockRepository,
    carbonSavingPolicy,
    rewardPointPolicy
  );

  it("calculates rewards for a member on a given day", async () => {
    mockRepository.updates = [];
    mockRepository.journeyIndex = {
      1: {
        "2019-12-15": [
          { id: 1, member_id: 1, mode: "Bus", distance: 2.4, device_id: "123456" },
          { id: 2, member_id: 1, mode: "Train", distance: 2.4, device_id: "01345456" },
        ]
      }
    };
    await job.run();

    const [memberId, journeys, rewardPoints, carbonSaving, totalDistance] = mockRepository.updates[0];

    chai.expect(memberId).to.equal(1);
    chai.expect(rewardPoints).to.equal(400);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(totalDistance).to.equal(4.8);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(1);
  });

  it("calculates rewards for multiple members on a given day", async () => {
    mockRepository.updates = [];
    mockRepository.journeyIndex = {
      1: {
        "2019-12-15": [
          { id: 1, member_id: 1, mode: "Bus", distance: 2.4, device_id: "123456" },
          { id: 2, member_id: 1, mode: "Train", distance: 2.4, device_id: "01345456" },
        ]
      },
      2: {
        "2019-12-15": [
          { id: 3, member_id: 2, mode: "Bus", distance: 2.4, device_id: "123456" },
          { id: 4, member_id: 2, mode: "Train", distance: 2.4, device_id: "01345456" },
        ]
      }
    };
    await job.run();

    let [memberId, journeys, rewardPoints, carbonSaving] = mockRepository.updates[0];

    chai.expect(memberId).to.equal(1);
    chai.expect(rewardPoints).to.equal(400);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(1);

    [memberId, journeys, rewardPoints, carbonSaving] = mockRepository.updates[1];

    chai.expect(memberId).to.equal(2);
    chai.expect(rewardPoints).to.equal(400);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(3);
  });

  it("calculates rewards for a member on multiple days", async () => {
    mockRepository.updates = [];
    mockRepository.journeyIndex = {
      1: {
        "2019-12-15": [
          { id: 1, member_id: 1, mode: "Bus", distance: 2.4, device_id: "123456" },
          { id: 2, member_id: 1, mode: "Train", distance: 2.4, device_id: "01345456" },
        ],
        "2019-12-16": [
          { id: 3, member_id: 1, mode: "Bus", distance: 2.4, device_id: "123456" },
          { id: 4, member_id: 1, mode: "Train", distance: 2.4, device_id: "01345456" },
        ]
      }
    };
    await job.run();

    let [memberId, journeys, rewardPoints, carbonSaving, totalDistance] = mockRepository.updates[0];

    chai.expect(memberId).to.equal(1);
    chai.expect(rewardPoints).to.equal(400);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(totalDistance).to.equal(4.8);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(1);

    [memberId, journeys, rewardPoints, carbonSaving] = mockRepository.updates[1];

    chai.expect(memberId).to.equal(1);
    chai.expect(rewardPoints).to.equal(400);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(3);
  });

  it("calculates rewards from multiple readers", async () => {
    mockRepository.updates = [];
    mockRepository.journeyIndex = {
      1: {
        "2019-12-15": [
          { id: 1, member_id: 1, mode: "Bus", distance: 2.4, device_id: "01345456" },
          { id: 2, member_id: 1, mode: "Train", distance: 2.4, device_id: "" },
        ]
      }
    };
    mockRepository.rewards = {
      existingRewards: 50,
      devices: ["01345456"]
    };

    await job.run();

    let [memberId, journeys, rewardPoints, carbonSaving, totalDistance] = mockRepository.updates[0];
    chai.expect(memberId).to.equal(1);
    chai.expect(journeys[0][0]).to.equal(0);
    chai.expect(journeys[0][1]).to.equal(0);
    chai.expect(journeys[0][2]).to.equal(0);
    chai.expect(journeys[0][3]).to.equal(1);
    chai.expect(journeys[1][0]).to.equal(2.4);
    chai.expect(journeys[1][1]).to.equal(250);
    chai.expect(journeys[1][2]).to.equal(0.6565439999999999);
    chai.expect(journeys[1][3]).to.equal(2);
    chai.expect(rewardPoints).to.equal(250);
    chai.expect(carbonSaving).to.equal(0.6565439999999999);
    chai.expect(totalDistance).to.equal(2.4);
  });

  it("allows multiple journeys with no device ID", async () => {
    mockRepository.updates = [];
    mockRepository.journeyIndex = {
      1: {
        "2019-12-15": [
          { id: 1, member_id: 1, mode: "Bus", distance: 2.4, device_id: "" },
          { id: 2, member_id: 1, mode: "Train", distance: 2.4, device_id: "" },
        ]
      }
    };
    mockRepository.rewards = {
      existingRewards: 50,
      devices: []
    };

    await job.run();

    let [memberId, journeys, rewardPoints, carbonSaving, totalDistance] = mockRepository.updates[0];
    chai.expect(memberId).to.equal(1);
    chai.expect(journeys[0][0]).to.equal(2.4);
    chai.expect(journeys[0][1]).to.equal(250);
    chai.expect(journeys[0][2]).to.equal(0.5296559999999999);
    chai.expect(journeys[0][3]).to.equal(1);
    chai.expect(journeys[1][0]).to.equal(2.4);
    chai.expect(journeys[1][1]).to.equal(100);
    chai.expect(journeys[1][2]).to.equal(0.6565439999999999);
    chai.expect(journeys[1][3]).to.equal(2);
    chai.expect(rewardPoints).to.equal(350);
    chai.expect(carbonSaving).to.equal(1.1862);
    chai.expect(totalDistance).to.equal(4.8);
  });

});
