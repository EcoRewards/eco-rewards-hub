import { ViewFactory } from "../service/controller/ReadController";
import { Trophy, TrophyJsonView } from "./Trophy";
import { TrophyView } from "./TrophyView";

/**
 * Creates a LocationView
 */
export class TrophyViewFactory implements ViewFactory<Trophy, TrophyJsonView> {

  public async create(): Promise<TrophyView> {
    return new TrophyView();
  }

}
