import { Request, Response } from "express";
import { Match } from "../entities/Match";
import { Team } from "../entities/Team";
import AppDataSource from "../data-source";

const matchRepository = AppDataSource.getRepository(Match);
const teamRepository = AppDataSource.getRepository(Team);


class MatchController {
  public async createMatch(req: Request, res: Response): Promise<Response> {
    const { idhost, idvisitor, data} = req.body;

    const host = await teamRepository.findOne({ where: { id: idhost }});
    const visitor = await teamRepository.findOne({ where: { id: idvisitor }});
    

    const newMatch = new Match();
    newMatch.host = host;
    newMatch.visitor = visitor;
    newMatch.data = data;

    const result = await matchRepository.save(newMatch);

    return res.status(201).json(result);
  }

  public async getMatches(req: Request, res: Response): Promise<Response> {
    const { limit, offset} = req.body;

    const matches = await matchRepository.find({
      relations: ["host", "visitor"],
      order: { data: "DESC" },
      skip: offset,
      take: limit
    });

    return res.status(200).json(matches);
  }

  public async getMatchesByTeamId(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { limit, offset } = req.body;

    const matches = await matchRepository.createQueryBuilder('match')
      .leftJoinAndSelect('match.host', 'host')
      .leftJoinAndSelect('match.visitor', 'visitor')
      .where('host.id = :id OR visitor.id = :id', { id })
      .orderBy('match.data', 'DESC')
      .skip(offset || 0)
      .take(limit || 10)
      .getMany();

    return res.status(200).json(matches);
  }

  public async updateMatch(req: Request, res: Response): Promise<Response> {
    const { id, idhost, idvisitor, data } = req.body;

    const host = await teamRepository.findOne({ where: { id: idhost } });

    if (!host) {
      return res.status(400).json({ error: "Mandante desconhecido" });
    }

    const visitor = await teamRepository.findOne({ where: { id: idvisitor } });
    if (!visitor) {
      return res.status(400).json({ error: "Visitante desconhecido" });
    }

    const match = await matchRepository.findOne({ where: { id: id }});
    if (!match) {
      return res.status(404).json({ error: "Partida não encontrada" });
    }

    match.host = host;
    match.visitor = visitor;
    match.data = data;

    const result = await matchRepository.save(match);

    return res.status(200).json(result);
  }

  public async deleteMatch(req: Request, res: Response): Promise<Response> {
    const { id } = req.body;
    const match = await matchRepository.findOne({ where: { id } });
  
    if (!match) {
      return res.status(404).json({ raw: [], affected: 0 });
    }
  
    const result = await matchRepository.delete({ id });
  
    return res.status(200).json(result);
  }
  
}

const match = new MatchController();
export default match;

