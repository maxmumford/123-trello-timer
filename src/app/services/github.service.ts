import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'app/services/electron.service';

var compareVersions = require('compare-versions');

interface GithubAsset {
  browser_download_url: string
}

interface GithubRelease {
  tag_name: string
  assets: GithubAsset[]
}

interface Release { 
  version: string
  downloadUrl: string  
}

@Injectable()
export class GithubService {

  constructor(
    private http: HttpClient,
    private electronService: ElectronService
  ) { }

  getNewRelease(): Observable<Release | null> {
    const currentVersion = this.electronService.getVersion()

    // get releases from github
    return this.http.get<GithubRelease>("https://api.github.com/repos/maxmumford/123-trello-timer/releases/latest")

        // map them onto our release object
        .map(gr => {
          return {
            version: gr.tag_name,
            downloadUrl: gr.assets[0].browser_download_url
          }
        })

        // extract latest release and return it
        .map(release => {
          if(compareVersions(release.version, currentVersion) >= 1)
            return release
          return null
        })
  }

}
