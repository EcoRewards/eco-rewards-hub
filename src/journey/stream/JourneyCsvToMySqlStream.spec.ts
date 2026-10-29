import * as chai from "chai";
import { JourneyFactory } from "../JourneyFactory";
import { JourneyCsvToMySqlStream } from "./JourneyCsvToMySqlStream";
import { MemberModelFactory } from "../../member/MemberModelFactory";

describe("JourneyCsvToMySqlStream", () => {
  const factory = new JourneyFactory({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1,
      smartcard: null,
      total_miles: 50,
      previous_transport_mode: null
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 50,
      previous_transport_mode: null
    }
  }, {}, {} as any, new MemberModelFactory(), { exportAll: () => {} } as any);

  it("returns errors", (done) => {
    const stream = new JourneyCsvToMySqlStream(factory, 1);

    stream.write(["0001112221", "2019-12-09T15:10:05"]);

    stream.end(() => {
      chai.expect(stream.getErrors()).to.deep.equal(["Invalid account number: 0001112221"]);
      done();
    });

  });

  it("passes through values", async () => {
    const stream = new JourneyCsvToMySqlStream(factory, 1);

    stream.on("data", buffer => {
      const values = buffer.toString().split(",");

      chai.expect(values[0]).to.equal("");
      chai.expect(values[1]).to.equal("1");
      chai.expect(values[2]).to.not.equal("");
      chai.expect(values[3]).to.equal("");
      chai.expect(values[4]).to.equal("2019-12-09T15:10:05");
      chai.expect(values[5]).to.equal("2");
      chai.expect(values[6]).to.equal("1.57");
      chai.expect(values[7]).to.equal("bus");
    });

    stream.write(["0000000026", "2019-12-09T15:10:05"]);

    await new Promise(r => stream.end(r));

    chai.expect(stream.getErrors().length).to.equal(0);
  });

});
