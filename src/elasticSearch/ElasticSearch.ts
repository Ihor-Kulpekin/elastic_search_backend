import {Injectable} from "@nestjs/common";
import {Client} from '@elastic/elasticsearch'

@Injectable()
export class ElasticSearch {
    private client: Client;

    public getInstance(): Client {
        if (this.client == null) {
            this.client = new Client({
                node: 'http://localhost:9200',
                auth: {
                    username: 'elastic', password: 'changeme'
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        }

        return this.client;
    }
}
