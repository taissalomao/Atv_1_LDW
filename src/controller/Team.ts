import { Request, Response } from 'express';
import { Team } from '../entities/Team';
import AppDataSource from '../data-source';
import { ILike } from 'typeorm';

const teamRepository = AppDataSource.getRepository(Team);

class TeamController {
    public async create(req: Request, res: Response): Promise<Response> {
        const { name} = req.body;
        if (!name || name.trim() === '') {
            return res.json({error: "Nome necessário"});
        }

        const team = new Team();
        team.name = name;

       const response:any = await AppDataSource.manager.save(Team, team).catch((e) => {
           return {error: e.message};
       });
         return res.json(response);
    }

    public async list(req: Request, res: Response): Promise<Response> {
        const teams = await AppDataSource.getRepository(Team).find({
            order: {
                name: 'asc'
            }
        });
        return res.json(teams);
    }

    public async listByName(req: Request, res: Response): Promise<Response> {
        const { name } = req.params;
        const teams = await AppDataSource.getRepository(Team).find({
            where: {
                name: ILike(`%${name}%`)
            },
            order: {
                name: 'asc'
            }
        });
        return res.json(teams);
    }

    public async updateTeam(
        req: Request,
        res: Response,
      ) {
        const { id } = req.params;
        const { name } = req.body;
        try {
          const existingTeam = await teamRepository.findOne({ where: { name } });
          if (existingTeam && existingTeam.id !== id) {
            return res.status(400).json({ error: `O nome ${name} já existe`});
          }
      
          const update = await teamRepository
            .createQueryBuilder()
            .update(Team)
            .set({
              name: name,
            })
            .where("id = :id", { id: id })
            .execute();
          return res.status(201).json({ ok: `O time ${name} atualizado` });
        } catch (error) {
          res.json(error);
        }
    }

    public async deleteTeam(req: Request, res: Response): Promise<Response> {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: "ID necessário" });
        }
        
        try {
          const deleteResult = await teamRepository.delete(id);
          return res.json({
            raw: deleteResult.raw,
            affected: deleteResult.affected
          });
        } catch (error) {
          return res.status(500).json({ error: "Erro ao excluir time" });
        }
        
        const team = await teamRepository.findOne(id);
        if (!team) {
          return res.json({ raw: [], affected: 0 });
        }
    }
}

const team = new TeamController();
export default team;